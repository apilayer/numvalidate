import {
  toInt,
  promisify,
  getObjectKey,
  generateApiToken,
  isApiTokenValid,
} from '../utils/common';

describe('toInt', () => {
  it('should parse a string to an integer', () => {
    expect(toInt(5)).toBe(5);
    expect(toInt('6')).toBe(6);
    expect(toInt(null, 7)).toBe(7);
  });
});

describe('promisify', () => {
  const cb = (err, info) => {

  }

  const cbTest = (cb) => {
    cb(null, 5);
  }

  it('should convert a function with a callback to a promise', async () => {
    const promisifiedCbTest = promisify(cbTest);
    const result = await promisifiedCbTest;
    expect(result).toBe(5);
  });
});

describe('getObjectKey', () => {
  const obj = {
    asd: true,
    'a123': true,
    'A123': true,
  };

  it(`should return the first key of the object that matches the given key without
  considering object's property's case`, () => {
    expect(getObjectKey(obj, 'asd')).toBe('asd');
    expect(getObjectKey(obj, 'a123')).toBe('a123');
    expect(getObjectKey(obj, 'qwerty')).toBe(undefined);
  });
});

describe('generateApiToken', () => {
  it('should generate an API token of 32 characters', () => {
    const a = generateApiToken();
    const b = generateApiToken();
    expect(typeof a).toBe('string');
    expect(typeof b).toBe('string');
    expect(a.length).toBe(32);
    expect(b.length).toBe(32);
    expect(a).not.toBe(b);
  });
});

describe('isApiTokenValid', () => {
  it('should check if the token provided is valid', () => {
    expect(isApiTokenValid(generateApiToken())).toBe(true);
    expect(isApiTokenValid('abc')).toBe(false);
    expect(isApiTokenValid(123)).toBe(false);
    expect(isApiTokenValid(NaN)).toBe(false);
    expect(isApiTokenValid('abcdefghijklmnopqrstuvwxyz012345')).toBe(false);
  });
});