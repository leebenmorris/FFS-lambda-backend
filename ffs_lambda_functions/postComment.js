const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const { responseObj } = require('../helpers/helpers');

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);


async function postComment(eventBody) {
  const query = `
    INSERT INTO comments (comment, user_id, connecting_comment_id, article_id) 
    VALUES ($1, $2, $3, $4)
    RETURNING id`;

  const { comment, userId, threadId, articleId } = eventBody;

  try {
    const commentId = await db.one(query, [comment, userId, threadId, articleId]);
    pgp.end();
    return {
      message: 'comment added to database',
      commentId: commentId.id
    };
  }
  catch (err) { return err; }
}

const handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  postComment(JSON.parse(event.body))
    .then(res => cb(null, responseObj(res, 201)))
    .catch(err => cb(new Error(err)));
};

module.exports = {
  handler,
  postComment
};
