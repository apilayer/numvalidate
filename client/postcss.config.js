module.exports = {
  plugins: [
    require('postcss-easy-import')({ prefix: '_' }),
    require('postcss-custom-properties')(),
    require('autoprefixer')(),
    require('cssnano')(),
  ],
};
