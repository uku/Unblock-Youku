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


// for both chrome extension and server
unblock_youku.common_urls = [
    'http://v.youku.com/player/*',
    'http://api.youku.com/player/*',
    'http://v2.tudou.com/*',
    'http://www.tudou.com/a/*',
    'http://www.tudou.com/v/*',
    'http://s.plcloud.music.qq.com/fcgi-bin/p.fcg*',
    'http://hot.vrs.sohu.com/*',
    'http://live.tv.sohu.com/live/player*',
    'http://hot.vrs.letv.com/*',
    'http://g3.letv.cn/*',
    'http://data.video.qiyi.com/*',

    // cause oversea servers unusable?
    // 'http://interface.bilibili.tv/player*',

    'http://220.181.61.229/*',
    'http://61.135.183.45/*',
    'http://61.135.183.46/*',
    'http://220.181.19.218/*',
    'http://220.181.61.213/*',
    'http://220.181.118.181/*',
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

    'http://music.sina.com.cn/yueku/intro/*',
    //'http://ting.baidu.com/data/music/songlink*',
    //'http://ting.baidu.com/data/music/songinfo*',
    //'http://ting.baidu.com/song/*/download*',
    'http://music.sina.com.cn/radio/port/webFeatureRadioLimitList.php*',
    'http://play.baidu.com/data/music/songlink*',

    'http://v.iask.com/v_play.php*',
    'http://v.iask.com/v_play_ipad.cx.php*',
    'http://tv.weibo.com/player/*',

    //'http://kandian.com/player/getEpgInfo*',  // !!!
    //'http://cdn.kandian.com/*',
    'http://www.yinyuetai.com/insite/*',
    'http://www.yinyuetai.com/main/get-video-info*',

    'http://*.dpool.sina.com.cn/iplookup*',
    'http://*/vrs_flash.action*',
    'http://*/?prot=2&type=1*',
    'http://*/?prot=2&file=/*',

    'http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do*'
];

// only for chrome extension
unblock_youku.chrome_extra_urls = [
    // 'http://www.tudou.com/programs/view/*',
    // 'http://www.tudou.com/albumplay/*',
    // 'http://www.tudou.com/listplay/*',

    'http://live.video.sina.com.cn/room/*',
    'http://edge.v.iask.com/*',  // may be large files

    'http://pay.youku.com/buy/redirect.html*',
    'http://pay.video.qq.com/fcgi-bin/paylimit*',

    'http://play.baidu.com/*',
    'http://zhangmenshiting.baidu.com/*',
    'http://music.baidu.com/box*',
    'http://music.baidu.com/data/music/songlink*',
    'http://music.baidu.com/data/music/songinfo*',
    'http://music.baidu.com/data/music/fmlink*',
    'http://music.baidu.com/song/*/download*',
    'http://fm.baidu.com/*',
    'http://www.kugou.com/*',
    'http://music.baidu.com/data/user/collect*',

    'http://v.pptv.com/show/*.html',
    'http://www.songtaste.com/*',
    'http://songtaste.com/*',
    'http://www.yyets.com/*',
    'http://imanhua.com/comic/*',
    'http://www.imanhua.com/comic/*',
    'http://imanhua.com/v2*',
    'http://www.imanhua.com/v2*'
];

// only for server
unblock_youku.server_extra_urls = [
    // for iOS apps
    'http://api.3g.youku.com/layout*',
    'http://api.tv.sohu.com/*',
    'http://access.tv.sohu.com/*',
    'http://3g.music.qq.com/*',
    'http://mqqplayer.3g.qq.com/*',
    'http://proxy.music.qq.com/*',
    'http://api.3g.tudou.com/*',
    'http://mobi.kuwo.cn/*',
    'http://mobilefeedback.kugou.com/*',
    'http://tingapi.ting.baidu.com/v1/restserver/ting?*method=baidu.ting.song*',
    'http://api.3g.youku.com/v3/play/address*',
    'http://api.3g.youku.com/openapi-wireless/videos/*/download*',
    'http://api.3g.youku.com/videos/*/download*',
    'http://play.api.3g.tudou.com/v3_1/*',
    'http://iface2.iqiyi.com/php/xyz/iface/*',

    // for 3rd party's DNS for Apple TV (see pull request #78)
    'http://180.153.225.136/*',
    'http://118.244.244.124/*',
    'http://210.129.145.150/*',
];


function urls2regexs(url_list) {
    "use strict";

    var regex_list = [];

    var i, re_str;
    for (i = 0; i < url_list.length; i++) {
        re_str = url_list[i].replace(/\//g, '\\/');
        re_str = re_str.replace(/\./g, '\\.');
        re_str = re_str.replace(/\*/g, '.*');
        // make the first * matches only domain names or ip addresses
        // just as http://developer.chrome.com/extensions/match_patterns.html
        re_str = re_str.replace(/^http:\\\/\\\/\.\*/i, 'http:\/\/[^\/]*');
        regex_list.push(new RegExp('^' + re_str, 'i'));
    }

    return regex_list;
}


// also export as a node.js module
var exports = exports || {};
exports.url_list = unblock_youku.common_urls.concat(unblock_youku.server_extra_urls);
exports.url_regex_list = urls2regexs(exports.url_list);
