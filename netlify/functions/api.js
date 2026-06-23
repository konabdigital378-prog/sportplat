const { app } = require('../../server/app');
const serverless = require('serverless-http');

const handler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return handler(event, context);
};
