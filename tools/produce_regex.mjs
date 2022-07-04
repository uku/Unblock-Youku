import {PROXY_URLS} from '../configs/urls.mjs';
import {produceSquidRegexList} from './_regex_utils.mjs';

console.log(produceSquidRegexList(PROXY_URLS).join('\n') + '\n');
process.exit(0);
