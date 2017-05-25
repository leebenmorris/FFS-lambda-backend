const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  entry: {
    longLink: './ffs_lambda_functions/longLink.js',
    getArticlesOrCommentsByArticleId: './ffs_lambda_functions/getArticlesOrCommentsByArticleId',
    getDomainsOrArticlesByDomainId: './ffs_lambda_functions/getDomainsOrArticlesByDomainId',
    postArticle: './ffs_lambda_functions/postArticle',
    postComment: ['./ffs_lambda_functions/postComment'],  // in array to allow export of functions for testing
    changeCommentVotes: './ffs_lambda_functions/changeCommentVotes',
    searchData: './ffs_lambda_functions/searchData'
  },
  target: 'node',
  externals: [
    // exclude all dev dependencies
    nodeExternals() 
  ],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: [
            [
              // using babel env preset to specifically target the 6.10 environment in AWS Lambda
              'env',    
              {
                targets: {
                  node: '6.10'
                }
              }
            ],
            // using babel babili preset to minify code
            'babili'    
          ]
        }
      }
    ]
  }
};