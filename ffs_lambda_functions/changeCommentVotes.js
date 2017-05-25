const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const { responseObj } = require('../helpers/helpers');

async function changeVotes (vote, id) {
  const voteChange = { up: 1, down: -1 }[vote] || 0;
  const query = `
    UPDATE comments 
    SET votes = votes + $1 
    WHERE comments.id = $2
    RETURNING votes`;
    
  try {
    const numVotes = await db.one(query, [voteChange, id]);
    pgp.end();
    return {
      message: 'comments table updated',
      numVotes: numVotes.votes
    };
  }
  catch (err) {return err;}
}

const handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  changeVotes(event.queryStringParameters.vote, event.queryStringParameters.id)
    .then(res => cb(null, responseObj(res, 200)))
    .catch(err => cb(new Error(err)));
};

module.exports = {
  handler,
  changeVotes
};
