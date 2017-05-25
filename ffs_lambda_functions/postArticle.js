const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });
const url = require('url');

const { responseObj } = require('../helpers/helpers');
const { postComment } = require('./postComment');

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const getDomainId = 'SELECT id FROM domains WHERE domain = $1';
const getArticleId = 'SELECT id FROM articles WHERE href = $1';

const addDomain = `
  INSERT INTO domains (domain) 
  VALUES ($1)
  ON CONFLICT DO NOTHING`;
const addArticle = `
  INSERT INTO articles (title, domain_id, href, user_id) 
  VALUES ($1, $2, $3, $4)
  ON CONFLICT DO NOTHING`;
const incrementArticleCountInDomainTable = `
  UPDATE domains 
  SET article_count = article_count + 1 
  WHERE domains.id = $1`;

async function updateTables(eventBody) {

  const { title, comment, href, userId } = eventBody;

  const urlObj = url.parse(href);
  const articleHref = urlObj.protocol ? urlObj.hostname + urlObj.pathname : urlObj.pathname;
  const articleDomain = urlObj.protocol ? urlObj.hostname : url.parse('http://' + href).hostname;

  let andDomainText = '';

  try {
    let articleId = await db.oneOrNone(getArticleId, articleHref);
    articleId = articleId && articleId.id;

    let domainId = await db.oneOrNone(getDomainId, articleDomain);
    domainId = domainId && domainId.id;

    if (articleId) {
      const commentData = await postComment({ comment, userId, articleId });

      pgp.end();
      return {
        message: 'article and domain already in database, and comment added to database',
        newArticle: false,
        articleId: articleId,
        domainId: domainId,
        commentId: commentData.commentId
      };
    }


    if (!domainId) {
      await db.none(addDomain, articleDomain);
      domainId = (await db.one(getDomainId, articleDomain)).id;
      andDomainText = 'and domain ';
    }

    await db.none(addArticle, [title, domainId, articleHref, userId]);
    articleId = (await db.oneOrNone(getArticleId, articleHref)).id;

    await db.none(incrementArticleCountInDomainTable, domainId);

    const commentData = await postComment({ comment, userId, articleId });

    pgp.end();
    return {
      message: 'article ' + andDomainText + 'added to database, and comment added to database',
      newArticle: true,
      articleId: articleId,
      domainId: domainId,
      commentId: commentData.commentId
    };
  }
  catch (err) { return err; }
}

module.exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  updateTables(JSON.parse(event.body))
    .then(res => cb(null, responseObj(res, 200)))
    .catch(err => cb(new Error(err)));
};
