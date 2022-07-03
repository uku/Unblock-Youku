import {PROXY_URLS} from '../src/configs/urls.mjs';
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

// console.log(produceSquidRegexList(PROXY_URLS).join('\n') + '\n');
console.log(produceSquidRegexList(TEST_URL_LIST).join('\n') + '\n');
process.exit(0);
