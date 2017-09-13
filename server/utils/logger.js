const winston = require('winston');
const keys = require('../config/keys');
require('winston-papertrail').Papertrail;

module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true,
    }),
    new winston.transports.Papertrail({
      host: keys.PAPERTRAIL_HOST,
      port: keys.PAPERTRAIL_PORT,
      colorize: true,
    }),
  ],
});
