global._babelPolyfill || require('babel-polyfill');

const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const { articleObj, commentObj, responseObj } = require('../helpers/helpers');

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const getTopTenArticles = `
  SELECT articles.*, domains.organisation, domains.logo_url
  FROM articles 
  LEFT JOIN domains 
  ON articles.domain_id = domains.id 
  ORDER BY articles.post_date ASC 
  LIMIT 10`;
const getOneArticle = `
  SELECT articles.*, domains.organisation, domains.logo_url
  FROM articles 
  LEFT JOIN domains 
  ON articles.domain_id = domains.id 
  WHERE articles.id = $1`;
const getCommentsByArticleId = `
  SELECT comments.*, users.username 
  FROM comments 
  LEFT JOIN users 
  ON comments.user_id = users.id 
  WHERE comments.article_id = $1`;

async function buildOutput(articleId) {
  try {
    if (!articleId) {
      const topTenArticles = await db.query(getTopTenArticles);
      pgp.end();
      return topTenArticles.map(obj => articleObj(obj));
    }
    let articleData = await db.one(getOneArticle, articleId);
    articleData = articleObj(articleData);

    let comments = await db.query(getCommentsByArticleId, articleId);
    comments = comments.map(obj => commentObj(obj));

    pgp.end();
    return { articleData: articleData, comments: comments };
  }
  catch (err) {
    return err;
  }
}

module.exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const articleId = event.pathParameters && event.pathParameters.article_id;
  buildOutput(articleId)
    .then(res => cb(null, responseObj(res, 200)))
    .catch(err => cb(new Error(err)));
};