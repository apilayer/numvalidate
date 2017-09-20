const winston = require('winston');
const keys = require('../config/keys');
require('winston-papertrail').Papertrail;

const papertrailEnabled = keys.IS_ENV_PRODUCTION && keys.PAPERTRAIL_HOST && keys.PAPERTRAIL_PORT;

const transports = [];

transports.push(
  new winston.transports.Console({
    colorize: true,
    prettyPrint: true,
  })
);

if (papertrailEnabled) {
  transports.push(
    new winston.transports.Papertrail({
      host: keys.PAPERTRAIL_HOST,
      port: keys.PAPERTRAIL_PORT,
      colorize: true,
    })
  );
}

const logger = new winston.Logger({
  transports: transports,
});

module.exports = logger;
