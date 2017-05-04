global._babelPolyfill || require('babel-polyfill');

const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const { responseObj } = require('../helpers/helpers');

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const changeVotes = `UPDATE comments SET votes = votes + $1 WHERE comments.id = $2`;

async function updateTables(params) {
  try {
    const voteChange = { up: 1, down: -1 }[params.vote] || 0;

    await db.none(changeVotes, [voteChange, params.id]);
    pgp.end();

    return {
      message: 'comments table updated',
      statusCode: 200
    };
  }
  catch (err) {
    return err;
  }
}

module.exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  updateTables(event.queryStringParameters)
    .then(res => cb(null, responseObj(res, 200)))
    .catch(err => cb(new Error(err)));
};
