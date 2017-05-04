global._babelPolyfill || require('babel-polyfill');

const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const { responseObj } = require('../helpers/helpers');

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const addComment = `
  INSERT INTO comments (comment, user_id, connecting_comment_id, article_id) 
  VALUES ($1, $2, $3, $4)`;

async function updateTables(body) {
  body = JSON.parse(body);

  const comment = body.comment;
  const userId = body.userId;
  const threadId = body.threadId;
  const articleId = body.articleId;

  try {
    await db.none(addComment, [comment, userId, threadId, articleId]);
    pgp.end();
    return {
      message: 'comment added to database'
    };
  }
  catch (err) {
    return err;
  }
}

module.exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  updateTables(event.body)
    .then(res => cb(null, responseObj(res, 201)))
    .catch(err => cb(new Error(err)));
};
