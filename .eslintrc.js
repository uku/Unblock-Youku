module.exports = {
  env: {
    es2021: true,
    browser: true,
    webextensions: true,
    node: true,
    jquery: true,
  },
  extends: [
    'google',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'require-jsdoc': 'off',
    'max-len': ['error', {'code': 100}],
  },
};
