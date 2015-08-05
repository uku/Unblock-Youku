var url_parse = require('url').parse;
var assert = require('assert');

var urls2pac = require('../shared/tools').urls2pac;
var crx_url_list = require('../shared/urls').crx_url_list;
// var server_url_list = require('../shared/urls').url_list;
// var server_url_whitelist = require('../shared/urls').url_whitelist;


var proxy_str = 'localhost:8888';
var crx_pac_content = urls2pac([], crx_url_list, proxy_str);

/* jshint ignore:start */
eval(crx_pac_content);
/* jshint ignore:end */

function test_url(need_proxy, url) {
    // console.log(url);
    var hostname = url_parse(url).hostname;
    if (need_proxy) {
        assert.equal(
                'PROXY ' + proxy_str + '; DIRECT',
                FindProxyForURL(url, hostname)
        );
    } else {
        assert.equal(
                'DIRECT',
                FindProxyForURL(url, hostname)
        );
    }
}


function random_str() {
    var text = "";
    var max_len = 20;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.";

    for (var i = 0; i < max_len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text.slice(0, Math.floor(Math.random() * max_len));
}


for (var i = 0; i < crx_url_list.length; i++) {
    for (var j = 0; j < 30; j++) {
        var url = crx_url_list[i];
        url = url.replace(/\*/g, random_str());
        test_url(true, url);
    }
}

test_url(false, '');
test_url(false, '://');
test_url(false, 'ftp://');
test_url(false, 'http://');
test_url(false, 'https://');
test_url(false, 'http://github.com/zhuzhuor/Unblock-Youku');
test_url(false, 'https://github.com/zhuzhuor/Unblock-Youku');
test_url(false, 'http://www.google.com/test');
test_url(false, 'https://www.google.com/test');
test_url(false, 'http://w.youku.com/player');
test_url(false, 'https://v.youku.com/player');
test_url(false, 'http://vv.youku.com/player');
test_url(false, 'http://test.sohu.com/test/?prot=2&type=1');
test_url(false, 'http://test.sohu.com/test/?prot=2&file=/&good');
test_url(false, 'http://youku.com/abc.dpool.sina.com.cn/iplookup');
test_url(false, 'http://zhuzhu.org/test/vrs_flash.action');
test_url(false, 'http://zhuzhu.org/test/vrs_flash.action?abc');
test_url(false, 'http://www.google.com/search?{google:acceptedSuggestion}oq=test&sourceid=chrome&ie=UTF-8&q=test&qscrl=1');
test_url(false, 'https://www.google.com/search?{google:acceptedSuggestion}oq=test&sourceid=chrome&ie=UTF-8&q=test&qscrl=1');
