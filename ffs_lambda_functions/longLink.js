const request = require("request");
const url = require("url");

const { responseObj } = require('../helpers/helpers');

const resolveLongLink = eventBody => new Promise((resolve, reject) => {
  const urlObj = url.parse(eventBody.shortUrl);
  request(
    {
      method: "HEAD",
      url: 'https://' + (urlObj.hostname || '') + urlObj.pathname,
      followAllRedirects: true,
      headers: { 'User-Agent': 'request' }
    },
    (err, res) => err ? reject(err) : resolve({ longUrl: res.request.href })
  );
});

const handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  resolveLongLink(JSON.parse(event.body))
    .then(res => {
      console.log(res);
      cb(null, responseObj(res, 200));
    })
    .catch(err => cb(new Error(err)));
};

module.exports = {
  handler,
  resolveLongLink
};
