/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012, 2013 Bo Zhu http://zhuzhu.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


var unblock_youku = unblock_youku || {};  // namespace


unblock_youku.url_list = [
    'http://v.youku.com/player/*',
    'http://api.3g.youku.com/layout*',
    'http://api.youku.com/player/*',
    'http://v2.tudou.com/*',
    'http://www.tudou.com/a/*',
    'http://www.tudou.com/v/*',
    'http://api.3g.tudou.com/*', // tudou ipad app for apple
    'http://s.plcloud.music.qq.com/*',
    'http://hot.vrs.sohu.com/*',
    'http://live.tv.sohu.com/live/player*',
    'http://hot.vrs.letv.com/*',
    'http://g3.letv.cn/*',
    'http://data.video.qiyi.com/*',

    // cause oversea servers unusable?
    // 'http://interface.bilibili.tv/player*',

    'http://220.181.61.229/*',
    'http://61.135.183.46/*',
    'http://220.181.118.181/*',
    'http://220.181.19.218/*',
    'http://123.126.48.47/*',
    'http://123.126.48.48/*',

    'http://vv.video.qq.com/*',
    'http://geo.js.kankan.xunlei.com/*',
    'http://web-play.pptv.com/*',
    'http://web-play.pplive.cn/*',
    // 'http://c1.pptv.com/*',
    'http://dyn.ugc.pps.tv/*',
    'http://inner.kandian.com/*',
    'http://ipservice.163.com/*',
    'http://zb.s.qq.com/*',
    'http://ip.kankan.xunlei.com/*',
    'http://proxy.music.qq.com/*', //iphone QQ music for apple
    'http://3g.music.qq.com/*',
    'http://mqqplayer.3g.qq.com/*',
    'http://180.153.225.136/*', //appletvDns
	'http://118.244.244.124/*',//appletvDns	
	'http://210.129.145.150/*', //appletvDns
    'http://www.tudou.com/albumplay/*',//new tudou
	//'http://mobi.kuwo.cn/*', feedback a lot of errors, plz check that. thx
	'http://mobilefeedback.kugou.com/*', //kugou music


    'http://music.sina.com.cn/yueku/intro/*',
    //'http://ting.baidu.com/data/music/songlink*',
    //'http://ting.baidu.com/data/music/songinfo*',
    //'http://ting.baidu.com/song/*/download*',

    'http://v.iask.com/v_play.php*',
    'http://v.iask.com/v_play_ipad.cx.php*',
    'http://tv.weibo.com/player/*',

    //'http://kandian.com/player/getEpgInfo*',  // !!!
    //'http://cdn.kandian.com/*',
    'http://www.yinyuetai.com/insite/*',
    'http://www.yinyuetai.com/main/get-video-info*',

    'http://*.dpool.sina.com.cn/iplookup*',
    'http://*/vrs_flash.action*',
    // 'http://*/*',

    'http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do*'
];


unblock_youku.regex_url_list = [];
(function() {
    "use strict";
    var i, re_str;
    for (i = 0; i < unblock_youku.url_list.length; i++) {
        re_str = unblock_youku.url_list[i].replace(/\//g, '\\/');
        re_str = re_str.replace(/\./g, '\\.');
        re_str = re_str.replace(/\*/g, '.*');
        // make the first * matches only domain names or ip addresses
        // just as http://developer.chrome.com/extensions/match_patterns.html
        re_str = re_str.replace(/^http:\\\/\\\/\.\*/i, 'http:\/\/[^\/]*');
        unblock_youku.regex_url_list.push(new RegExp('^' + re_str, 'i'));
    }
}());
// console.log(unblock_youku.regex_url_list);


// also export as a node.js module
var exports = exports || {};
exports.url_list = unblock_youku.url_list;
exports.regex_url_list = unblock_youku.regex_url_list;
