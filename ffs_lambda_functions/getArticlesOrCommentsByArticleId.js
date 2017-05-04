global._babelPolyfill || require('babel-polyfill');

const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const getTopTenArticles = `
  SELECT articles.*, domains.organisation 
  FROM articles 
  LEFT JOIN domains 
  ON articles.domain_id = domains.id 
  ORDER BY articles.post_date ASC 
  LIMIT 10`;
const getOneArticle = `
  SELECT articles.*, domains.organisation 
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

const makeArticleObj = obj => ({
  _id: obj.id,
  title: obj.title,
  articleUrl: obj.href,
  description: obj.description,
  articleIsFakeNews: obj.is_fake,
  pending: obj.pending,
  organisation: obj.organisation,
  domainId: obj.domain_id,
  timeStamp: obj.post_date
});

const makeCommentsObj = obj => ({
  _id: obj.id,
  comment: obj.comment,
  threadId: obj.connecting_comment_id,
  articleId: obj.article_id,
  author: obj.username,
  votes: obj.votes,
  timeStamp: obj.date_added
});

async function buildOutput(articleId) {
  try {
    if (!articleId) {
      const topTenArticles = await db.query(getTopTenArticles);
      pgp.end();
      return topTenArticles.map(obj => makeArticleObj(obj));
    }
    let articleData = await db.one(getOneArticle, articleId);
    articleData = makeArticleObj(articleData);

    let comments = await db.query(getCommentsByArticleId, articleId);
    comments = comments.map(obj => makeCommentsObj(obj));
    
    pgp.end();
    return { articleData: articleData, comments: comments };
  }
  catch (err) {
    return err;
  }
}

module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const articleId = event.pathParameters ? event.pathParameters.article_id : null;
  buildOutput(articleId)
    .then(res => callback(null, {
      statusCode: '200',
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(res)
    }))
    .catch(err => callback(new Error(err)));
};