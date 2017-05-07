global._babelPolyfill || require('babel-polyfill');

const { resolveLongLink, responseObj } = require('../helpers/helpers');

module.exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  resolveLongLink(event.body)
    .then(res => cb(null, responseObj(res, 200)))
    .catch(err => cb(new Error(err)));
};