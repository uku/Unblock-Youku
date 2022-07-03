module.exports = {
  'preset': 'jest-puppeteer',
  'testRegex': '(/__tests__/.*|(\\.|/)(test|spec))\\.(mjs?|jsx?|js?|tsx?|ts?)$',
  'transform': {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
  },
  'moduleFileExtensions': ['js', 'jsx', 'mjs'],
};
