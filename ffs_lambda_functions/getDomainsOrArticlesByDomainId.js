global._babelPolyfill || require('babel-polyfill');

const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const getAllDomainsAndScores = `SELECT reliability, domain FROM domains`;
const getOneDomain = `SELECT * FROM domains WHERE id = $1`;
const getArticlesByDomainId = `
  SELECT articles.*, domains.organisation 
  FROM articles 
  LEFT JOIN domains 
  ON articles.domain_id = domains.id 
  WHERE domain_id = $1 
  ORDER BY articles.post_date ASC`;

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

const makeDomainObj = obj => ({
  _id: obj.id,
  organisationName: obj.organisation,
  registeredDomain: obj.domain,
  domainDescription: obj.org_description,
  reliabilityScore: obj.reliability,
  articleCount: obj.article_count,
  timeStamp: obj.date_added
});

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
    domainData = makeDomainObj(domainData);

    let articles = await db.query(getArticlesByDomainId, [domainId]);
    articles = articles.map(obj => makeArticleObj(obj));

    pgp.end();
    return { domainData: domainData, articles: articles };
  }
  catch (err) {
    return err;
  }
}

module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const domainId = event.pathParameters ? event.pathParameters.domain_id : null;
  buildOutput(domainId)
    .then(rows => callback(null, {
      statusCode: '200',
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rows)
    }))
    .catch(error => callback(new Error(error)));
};