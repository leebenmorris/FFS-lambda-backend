const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const { responseObj } = require('../helpers/helpers');

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const getAllArticles = `SELECT * FROM articles`;
const getAllDomains = `SELECT * FROM DOMAINS`;

const articleObj = obj => ({
  _id: obj.id,
  articleUrl: obj.href,
  title: obj.title,
  description: obj.description,
  articleIsFakeNews: obj.is_fake,
  pending: obj.pending,
  userId: obj.user_id,
  domainId: obj.domain_id,
  link: "articles",
  timeStamp: obj.post_date
});

const domainObj = obj => ({
  _id: obj.id,
  registeredDomain: obj.domain,
  reliabilityScore: obj.reliability,
  organisationName: obj.organisation,
  domainDescription: obj.org_description,
  articleCount: obj.article_count,
  link: "domains",
  timeStamp: obj.date_added
});

async function buildOutput() {
  try {
    let articles = await db.query(getAllArticles);
    articles = articles.map(obj => articleObj(obj));

    let domains = await db.query(getAllDomains);
    domains = domains.map(obj => domainObj(obj));

    pgp.end();
    return { articles: articles, domains: domains };
  }
  catch (err) { return err; }
}

module.exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  buildOutput()
    .then(res => cb(null, responseObj(res, 200)))
    .catch(err => cb(new Error(err)));
};