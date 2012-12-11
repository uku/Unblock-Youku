/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012 Bo Zhu http://zhuzhu.org
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
    'http://s.plcloud.music.qq.com/*',
    'http://hot.vrs.sohu.com/*',
    'http://live.tv.sohu.com/live/player*',
    'http://hot.vrs.letv.com/*',
    'http://data.video.qiyi.com/*',

    'http://220.181.61.229/*',
    'http://61.135.183.46/*',
    'http://220.181.118.181/*',
    //'http://*/?prot=2&type=*',

    'http://vv.video.qq.com/*',
    'http://geo.js.kankan.xunlei.com/*',
    'http://web-play.pptv.com/*',
    'http://web-play.pplive.cn/*',
    'http://dyn.ugc.pps.tv/*',
    'http://inner.kandian.com/*',
    'http://ipservice.163.com/*',
    'http://zb.s.qq.com/*',
    'http://ip.kankan.xunlei.com/*',


    'http://music.sina.com.cn/yueku/intro/*',
    //'http://ting.baidu.com/data/music/songlink*',
    //'http://ting.baidu.com/data/music/songinfo*',
    //'http://ting.baidu.com/song/*/download*',

    'http://v.iask.com/v_play.php*',
    //'http://v.iask.com/v_play_ipad.cx.php*',
    'http://int.dpool.sina.com.cn/iplookup*',
    //'http://kandian.com/player/getEpgInfo*',  // !!!
    //'http://cdn.kandian.com/*',
    'http://www.yinyuetai.com/insite/*',

    // 'http://*/*',

    'http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do*'
];


unblock_youku.regex_url_list = [];
(function() {
    var i, re_str;
    for (i = 0; i < unblock_youku.url_list.length; i++) {
        re_str = unblock_youku.url_list[i].replace(/\//g, '\\/');
        re_str = re_str.replace(/\./g, '\\.');
        re_str = re_str.replace(/\*/g, '.*');
        unblock_youku.regex_url_list.push(new RegExp('^' + re_str, 'i'));
    }
}());
// console.log(unblock_youku.regex_url_list);


// also export as a node.js module
var exports = exports || {};
exports.url_list = unblock_youku.url_list;
exports.regex_url_list = unblock_youku.regex_url_list;
