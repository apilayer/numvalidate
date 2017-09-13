/* @flow */

const delay = (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time));
};

export default {
  delay,
};
