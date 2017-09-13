const Raven = require('raven');
const keys = require('../config/keys');

if (keys.SENTRY_DNS) {
  Raven.config(keys.SENTRY_DNS, {
    autoBreadcrumbs: true,
    captureUnhandledRejections: true,
    environment: keys.EXECUTION_ENV,
  }).install();
}

exports.log = (msg, meta) => {
  if (meta.level === 'error' || meta.level === 'fatal') {
    Raven.captureException(msg, meta);
  }
  Raven.captureMessage(msg, meta);
};

exports.parseRequest = Raven.parsers.parseRequest;
