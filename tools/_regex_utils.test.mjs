import {produceSquidRegexList} from './_regex_utils.mjs';


const TEST_URL_LIST = [
  'http://*/*',
  'https://*/*',
  'http://*.video.qq.com/*',
  'https://*.video.qq.com/*',
  'http://vd.l.qq.com/*',
  'https://vd.l.qq.com/*',
  'http://example.com',
  'https://example.com',
  'http://example.com/',
  'https://example.com/',
  'http://*.example.com/*',
  'https://*.example.com/*',
  'http://*.example.com/path.json?aaa=bbb',
  'https://*.example.com/path.json?aaa=bbb',
  'http://*.example.com/path.json?aaa=bbb*',
  'https://*.example.com/path.json?aaa=bbb*',
  'http://122.72.82.31/*',
];

const EXPECTED_REGEX_LIST = [
  '^http:\\/\\/[^/]*\\/.*$',
  '^[^/]*:443',
  '^http:\\/\\/[^/]*\\.video\\.qq\\.com\\/.*$',
  '^[^/]*\\.video\\.qq\\.com:443',
  '^http:\\/\\/vd\\.l\\.qq\\.com\\/.*$',
  '^vd\\.l\\.qq\\.com:443',
  '^http:\\/\\/example\\.com$',
  '^https:\\/\\/example\\.com$',
  '^http:\\/\\/example\\.com\\/$',
  '^example\\.com:443',
  '^http:\\/\\/[^/]*\\.example\\.com\\/.*$',
  '^[^/]*\\.example\\.com:443',
  '^http:\\/\\/[^/]*\\.example\\.com\\/path\\.json\\?aaa=bbb$',
  '^[^/]*\\.example\\.com:443',
  '^http:\\/\\/[^/]*\\.example\\.com\\/path\\.json\\?aaa=bbb.*$',
  '^[^/]*\\.example\\.com:443',
  '^http:\\/\\/122\\.72\\.82\\.31\\/.*$',
];


test('Should produce the expected regex list', () => {
  expect(produceSquidRegexList(TEST_URL_LIST).sort()).toEqual(EXPECTED_REGEX_LIST.sort());
});
