const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const { articleObj, domainObj, responseObj } = require('../helpers/helpers');

const getAllDomainsAndScores = `SELECT reliability, domain FROM domains`;
const getOneDomain = `SELECT * FROM domains WHERE id = $1`;
const getArticlesByDomainId = `
  SELECT articles.*, domains.organisation, domains.logo_url
  FROM articles 
  LEFT JOIN domains 
  ON articles.domain_id = domains.id 
  WHERE domain_id = $1 
  ORDER BY articles.post_date ASC`;

async function buildOutput(domainId) {
  try {
    if (!domainId) {
      let domains = await db.query(getAllDomainsAndScores);
      pgp.end();
      return domains.reduce((obj, curr) => {
        obj[curr.domain] = curr.reliability;
        return obj;
      }, {});
    }
    let domainData = await db.one(getOneDomain, [domainId]);
    domainData = domainObj(domainData);

    let articles = await db.query(getArticlesByDomainId, [domainId]);
    articles = articles.map(obj => articleObj(obj));

    pgp.end();
    return { domainData: domainData, articles: articles };
  }
  catch (err) { return err; }
}

module.exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const domainId = event.pathParameters && event.pathParameters.domain_id;
  buildOutput(domainId)
    .then(res => cb(null, responseObj(res, 200)))
    .catch(error => cb(new Error(error)));
};