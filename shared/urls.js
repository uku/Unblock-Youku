/*
 * Copyright (C) 2012 Bo Zhu http://zhuzhu.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


var unblock_youku = unblock_youku || {};  // namespace


unblock_youku.url_list = [
    'http://v.youku.com/player/*',
    'http://v2.tudou.com/*',
    'http://s.plcloud.music.qq.com/*',

    'http://hot.vrs.sohu.com/*',
    'http://hot.vrs.letv.com/*',
    'http://data.video.qiyi.com/*',
    'http://vv.video.qq.com/*',
    'http://geo.js.kankan.xunlei.com/*',
    'http://web-play.pptv.com/*',
    'http://web-play.pplive.cn/*',
    'http://dyn.ugc.pps.tv/*',
    'http://inner.kandian.com/*',
    'http://ipservice.163.com/*',
    'http://zb.s.qq.com/*',
    'http://ip.kankan.xunlei.com/*',

    'http://v.iask.com/v_play.php*',
    //'http://v.iask.com/v_play_ipad.cx.php*',
    'http://int.dpool.sina.com.cn/iplookup*',
    'http://kandian.com/player/getEpgInfo*',
    'http://cdn.kandian.com/*',  // better to remove this later?

    'http://music.sina.com.cn/yueku/intro/*',
    //'http://down.v.iask.com/*',
    //'http://*.music.sina.com.cn/*',
    //'http://*/*.music.sina.com.cn/*',
    //'http://*/*/*.music.sina.com.cn/*',

    'http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do*'
];


unblock_youku.regex_url_list = [];
(function() {
    var re_str;
    for (var i in unblock_youku.url_list) {
        re_str = unblock_youku.url_list[i].replace(/\//g, '\\/');
        re_str = re_str.replace(/\./g, '\\.');
        re_str = re_str.replace(/\*/g, '.*');
        unblock_youku.regex_url_list.push(new RegExp('^' + re_str, 'i'));
    }
})();
// console.log(unblock_youku.regex_url_list);


// also export as a node.js module
var exports = exports || {};
exports.regex_url_list = unblock_youku.regex_url_list;
