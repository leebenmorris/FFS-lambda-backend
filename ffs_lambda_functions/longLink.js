global._babelPolyfill || require('babel-polyfill');

const request = require("request");
const url = require("url");

const { responseObj } = require('../helpers/helpers');

module.exports.longLink = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const urlObj = url.parse(JSON.parse(event.body).shortUrl);

  request(
    {
      method: "HEAD",
      url: 'https://' + (urlObj.hostname || '') + urlObj.pathname,
      followAllRedirects: true,
      headers: { 'User-Agent': 'request' }
    },
    (err, res) => {
      if (err) cb(new Error(err));
      cb(null, responseObj({ longUrl: res.request.href }, 200));
    }
  );
};
