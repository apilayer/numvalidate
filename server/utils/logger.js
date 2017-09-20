const winston = require('winston');
const keys = require('../config/keys');
require('winston-papertrail').Papertrail;

const papertrailEnabled = keys.IS_ENV_PRODUCTION && keys.PAPERTRAIL_HOST && keys.PAPERTRAIL_PORT;

const logger = new winston.Logger();

logger.add(winston.transports.Console, {
  colorize: true,
  prettyPrint: true,
});

if (papertrailEnabled) {
  logger.add(winston.transports.Papertrail, {
    host: keys.PAPERTRAIL_HOST,
    port: keys.PAPERTRAIL_PORT,
    colorize: true,
  });
}

module.exports = logger;
