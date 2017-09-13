/* @flow */
const delay = (time: number) => {
  // $FlowFixMe
  return new Promise(resolve => setTimeout(resolve, time));
};

/**
 * Parses a string to an integer.
 * Useful for converting environment variable (while maintaing the 0 values).
 * @param {Number|String} input The string to convert to integer.
 * @param {Number} defaultOutput Returned if the string is not a valid number.
 * @return {Promise} The generated Promise.
 */
const toInt = (input: ?string | number, defaultOutput: number): number => {
  if (typeof input === 'number') {
    return input;
  }
  if (input !== undefined && input !== null && !isNaN(input)) {
    return Number.parseInt(input, 10);
  } else {
    return defaultOutput;
  }
};

export default {
  delay,
  toInt,
};
