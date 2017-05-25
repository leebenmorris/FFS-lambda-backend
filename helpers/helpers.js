const helpers = {};

helpers.responseObj = (result, statusCode) => ({
  statusCode: statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS 
    "Content-Type": "application/json"
  },
  body: JSON.stringify(result)
});

helpers.articleObj = obj => ({
  _id: obj.id,
  title: obj.title,
  articleUrl: obj.href,
  description: obj.description,
  articleIsFakeNews: obj.is_fake,
  pending: obj.pending,
  organisation: obj.organisation,
  logoUrl: obj.logo_url,
  domainId: obj.domain_id,
  timeStamp: obj.post_date
});

helpers.commentObj = obj => ({
  _id: obj.id,
  comment: obj.comment,
  threadId: obj.connecting_comment_id,
  articleId: obj.article_id,
  author: obj.username,
  votes: obj.votes,
  timeStamp: obj.date_added
});

helpers.domainObj = obj => ({
  _id: obj.id,
  organisationName: obj.organisation,
  registeredDomain: obj.domain,
  domainDescription: obj.org_description,
  reliabilityScore: obj.reliability,
  articleCount: obj.article_count,
  logoUrl: obj.logo_url,
  timeStamp: obj.date_added
});

module.exports = helpers;


