const _ = require('lodash');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');

/**
 * Parses a string to an integer.
 * Useful for converting environment variable (while maintaing the 0 values).
 * @param {Number|String} input The string to convert to integer.
 * @param {Number} defaultOutput Returned if the string is not a valid number.
 * @return {Promise} The generated Promise.
 */
exports.toInt = (input, defaultOutput) => {
  if (typeof input === 'number') {
    return input;
  }
  if (input !== undefined && input !== null && !isNaN(input)) {
    return Number.parseInt(input, 10);
  } else {
    return defaultOutput;
  }
};

/**
 * Helper function to convert a callback to a Promise.
 * @param {Function} fn The function to promisify.
 * @return {Promise} The generated Promise.
 */
exports.promisify = async fn => {
  return await new Promise((resolve, reject) => {
    const callback = (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    };
    fn(callback);
  });
};

/**
 * Get the first key of the object that matches the given key using a 
 * case-insensitive search.
 * @param {Object} obj The object to search into.
 * @param {String} searchedKey The searched key (case does not matter).
 * @return {Any} The found key (or undefined).
 */
exports.getObjectKey = (obj, searchedKey) => {
  const foundKey = _.findKey(obj, (value, key) => {
    return key.toLowerCase() === searchedKey;
  });
  return foundKey;
};

/**
 * Gets a value from an object given its key using a case-insensitive search.
 * @param {Object} obj The object to search into.
 * @param {String} searchedKey The searched key (case does not matter).
 * @return {Any} The found value (or undefined).
 */
exports.getObjectValueByKey = (obj, searchedKey) => {
  const foundKey = exports.getObjectKey(obj, searchedKey);
  return foundKey ? obj[foundKey] : undefined;
};

/**
 * Checks if a JWT token is expired.
 * @param {Object} token The JWT token.
 * @return {Boolean} True if the JWT token is expired.
 */
exports.isJwtTokenExpired = token => {
  const payload = jsonwebtoken.decode(token);
  const clockTimestamp = Math.floor(Date.now() / 1000);
  return clockTimestamp >= payload.exp;
};

/**
 * Generates an API token of 32 characters composed by 16 random bytes.
 * @return {String} The generated API token.
 */
exports.generateApiToken = () => {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return randomBytes;
};

/**
 * Checks if an API token is valid.
 * @param {String} apiToken The API token.
 * @return {Boolean} True if the API token is valid.
 */
exports.isApiTokenValid = apiToken => {
  if (!_.isString(apiToken)) {
    return false;
  }
  if (apiToken.length !== 32) {
    return false;
  }
  const isHexRegexp = new RegExp('^[0-9a-fA-F]{32}$');
  if (!isHexRegexp.test(apiToken)) {
    return false;
  }
  return true;
};
