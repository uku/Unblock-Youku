'use strict';

const shared_urls = require('../shared/urls');

const chrome_regex_list = shared_urls.produce_squid_regex_list(/* for_pac_server= */ false);
const chrome_regex_text = chrome_regex_list.join('\n') + '\n';
console.log(chrome_regex_text);

process.exit(0);