const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const countries = require('../static/countries.json');

/**
 * GET /api/countries
 * 
 * @return {Object} The countries supported by this API.
 */
exports.getCountries = async ctx => {
  ctx.body = { data: countries };
};

/**
 * GET /api/validate
 * 
 * @param {String} number The phone number to validate.
 * @param {String} countryCode The country code of phone number to validate.
 * @return {Object} The validation result.
 */
exports.validate = async (ctx, next) => {
  ctx
    .validateQuery('number')
    .required()
    .isString();
  ctx
    .validateQuery('countryCode')
    .optional()
    .isString();
  const { number, countryCode } = ctx.vals;
  let numberToCheck = !countryCode ? `+${number}` : number;
  let result = {
    valid: false,
    number: undefined,
    e164Format: undefined,
    internationalFormat: undefined,
    nationalFormat: undefined,
    countryCode: undefined,
    countryPrefix: undefined,
    countryName: undefined,
  };
  result.number = number;
  result.countryCode = countryCode;
  try {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(numberToCheck, countryCode);
    result.valid = phoneUtil.isValidNumber(parsedNumber);
    if (result.valid) {
      result.number = number;
      result.e164Format = phoneUtil.format(parsedNumber, PNF.E164);
      result.internationalFormat = phoneUtil.format(parsedNumber, PNF.INTERNATIONAL);
      result.nationalFormat = phoneUtil.format(parsedNumber, PNF.NATIONAL);
      result.countryCode = phoneUtil.getRegionCodeForNumber(parsedNumber);
      result.countryPrefix = countries[result.countryCode].countryPrefix;
      result.countryName = countries[result.countryCode].countryName;
    }
  } catch (err) {
    console.log('Parsing error: ', err);
  }

  ctx.body = { data: result };
};
