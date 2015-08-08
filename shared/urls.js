/*
 * Copyright (C) 2012 - 2013  Bo Zhu  http://zhuzhu.org
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
    'http://play.youku.com/play/get.json*',
    'http://v2.tudou.com/*',
    'http://www.tudou.com/a/*',
    'http://www.tudou.com/v/*',
    'http://www.tudou.com/outplay/goto/getTvcCode*',
    'http://www.tudou.com/tvp/alist.action*',
    'http://s.plcloud.music.qq.com/fcgi-bin/p.fcg*',
    'http://i.y.qq.com/s.plcloud/fcgi-bin/p.fcg*',
    'http://hot.vrs.sohu.com/*',
    'http://live.tv.sohu.com/live/player*',
    'http://pad.tv.sohu.com/playinfo*',
    'http://my.tv.sohu.com/play/m3u8version.do*',
    'http://hot.vrs.letv.com/*',
    //'http://g3.letv.cn/*',
    'http://data.video.qiyi.com/v.*',
    'http://data.video.qiyi.com/videos/*',
    'http://data.video.qiyi.com/*/videos/*',
    // 'http://nl.rcd.iqiyi.com/apis/urc/*',
    'http://cache.video.qiyi.com/vms?*',
    'http://cache.vip.qiyi.com/vms?*',
    'http://cache.video.qiyi.com/vp/*/*/?src=*',
    'http://cache.video.qiyi.com/vps?*',
    'http://cache.video.qiyi.com/liven/*',
    'http://v.api.hunantv.com/player/video*',

    // cause oversea servers unusable?
    // 'http://interface.bilibili.tv/player*',

    // 'http://61.135.183.45/*',
    // 'http://61.135.183.46/*',
    // 'http://61.135.183.50/*',
    // 'http://220.181.61.229/*',
    // 'http://220.181.61.212/*',
    // 'http://220.181.61.213/*',
    // 'http://220.181.19.218/*',
    // 'http://220.181.118.181/*',
    // 'http://123.126.48.47/*',
    // 'http://123.126.48.48/*',
    // 'http://123.125.123.80/*',
    // 'http://123.125.123.81/*',
    // 'http://123.125.123.82/*',

    'http://vv.video.qq.com/*',
    'http://vv.video.qq.com/getvinfo*',
    'http://vv.video.qq.com/getinfo*',
    'http://vv.video.qq.com/geturl*',    
    'http://tt.video.qq.com/getvinfo*',
    'http://ice.video.qq.com/getvinfo*',
    'http://tjsa.video.qq.com/getvinfo*',
    'http://a10.video.qq.com/getvinfo*',
    'http://xyy.video.qq.com/getvinfo*',
    'http://vcq.video.qq.com/getvinfo*',
    'http://vsh.video.qq.com/getvinfo*',
    'http://vbj.video.qq.com/getvinfo*',
    'http://bobo.video.qq.com/getvinfo*',
    'http://flvs.video.qq.com/getvinfo*',
    'http://bkvv.video.qq.com/getvinfo*',
    'http://info.zb.qq.com/?*',

    'http://geo.js.kankan.xunlei.com/*',
    'http://web-play.pptv.com/*',
    'http://web-play.pplive.cn/*',
    // 'http://c1.pptv.com/*',
    'http://dyn.ugc.pps.tv/*',
    'http://v.pps.tv/ugc/ajax/aj_html5_url.php*',
    'http://inner.kandian.com/*',
    'http://ipservice.163.com/*',
    'http://so.open.163.com/open/info.htm*',
    'http://zb.s.qq.com/*',
    'http://ip.kankan.xunlei.com/*',
    'http://vxml.56.com/json/*',

    'http://music.sina.com.cn/yueku/intro/*',
    //'http://ting.baidu.com/data/music/songlink*',
    //'http://ting.baidu.com/data/music/songinfo*',
    //'http://ting.baidu.com/song/*/download*',
    'http://music.sina.com.cn/radio/port/webFeatureRadioLimitList.php*',
    'http://play.baidu.com/data/music/songlink*',

    'http://v.iask.com/v_play.php*',
    'http://v.iask.com/v_play_ipad.cx.php*',
    'http://tv.weibo.com/player/*',
    'http://wtv.v.iask.com/*.m3u8*',
    'http://wtv.v.iask.com/mcdn.php',
    'http://video.sina.com.cn/interface/l/u/getFocusStatus.php*',
    'http://wtv.v.iask.com/player/ovs1_idc_list.php*',

    //'http://kandian.com/player/getEpgInfo*',  // !!!
    //'http://cdn.kandian.com/*',
    'http://www.yinyuetai.com/insite/*',
    'http://www.yinyuetai.com/main/get-*',

    'http://*.dpool.sina.com.cn/iplookup*',
    'http://*/vrs_flash.action*',
    // 'http://*/?prot=2&type=1*',
    // 'http://*/?prot=2&file=/*',
    'http://api.letv.com/streamblock*',
    'http://api.letv.com/mms/out/video/play*',
    'http://api.letv.com/mms/out/common/geturl*',
    'http://api.letv.com/geturl*',
    'http://api.letv.com/api/geturl*',
    'http://st.live.letv.com/live/*',
    'http://live.gslb.letv.com/gslb?*',
    'http://static.itv.letv.com/api*',
    'http://ip.apps.cntv.cn/js/player.do*',
    'http://vdn.apps.cntv.cn/api/get*',
    'http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdcctv5*',
    'http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdcctv6*',
    'http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdcctv8*',
    'http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdbtv6*',
    'http://vip.sports.cntv.cn/check.do*',
    'http://vip.sports.cntv.cn/play.do*',
    'http://vip.sports.cntv.cn/servlets/encryptvideopath.do*',
    'http://211.151.157.15/*'
];

// only for chrome extension
unblock_youku.chrome_extra_urls = [
    'http://www.tudou.com/programs/view/*',
    'http://www.tudou.com/albumplay/*',
    'http://www.tudou.com/listplay/*',

    // 'http://live.video.sina.com.cn/room/*',
    // 'http://edge.v.iask.com/*',  // may be large files

    'http://pay.youku.com/buy/redirect.html*',
    'http://pay.tudou.com/buy/redirect.html*',
    'http://aid.video.qq.com/fcgi-bin/userip?*',
    'http://aidbak.video.qq.com/fcgi-bin/userip?*',
    'http://pay.video.qq.com/fcgi-bin/paylimit*',
    'http://paybak.video.qq.com/fcgi-bin/paylimit*',
    'http://chrome.2345.com/dianhua/index.php?m=call&f=check&*'
    // 'https://www.amazon.cn/gp/mas/order/ref*',
    // 'https://www.amazon.cn/gp/digital/fiona/payment-checkout/ref*',
    // 'https://www.amazon.cn/gp/aw/kindle/order.html*',

    // 'http://play.baidu.com/*',
    // 'http://zhangmenshiting.baidu.com/*',
    // 'http://music.baidu.com/box*',
    // 'http://music.baidu.com/data/service/sum*',
    // 'http://music.baidu.com/data/music/songlink*',
    // 'http://music.baidu.com/data/music/songinfo*',
    // 'http://music.baidu.com/data/music/fmlink*',
    // 'http://music.baidu.com/song/*/download*',
    // 'http://fm.baidu.com/*',
    // 'http://www.kugou.com/*',
    // 'http://music.baidu.com/data/user/collect*',

    // 'http://d.dxy.cn/*',
    // 'http://ac.qq.com/*/v/cid/*',
    // 'http://v.pptv.com/show/*.html',
    // 'http://www.songtaste.com/*',
    // 'http://songtaste.com/*',
    // 'http://www.yyets.com/*',
    // 'http://mainv2.img.duomi.com/*',
    // 'http://imanhua.com/comic/*',
    // 'http://www.imanhua.com/comic/*',
    // 'http://imanhua.com/v2*',
    // 'http://www.imanhua.com/v2*'
];

// only for server

unblock_youku.server_whitelist_urls = [
    // those does not need to go through proxy
    'http://*/ipad?file=/*'
];

unblock_youku.server_extra_urls = [
    // for Mobile apps    // Video apps
    'http://a.play.api.3g.youku.com/common/v3/play?*',
    'http://i.play.api.3g.youku.com/common/v3/play?*',
    'http://i.play.api.3g.youku.com/common/v3/hasadv/play?*',
    'http://api.3g.youku.com/layout*',
    'http://api.3g.youku.com/v3/play/address*',
    'http://api.3g.youku.com/openapi-wireless/videos/*/download*',
    'http://api.3g.youku.com/videos/*/download*',
    'http://api.3g.youku.com/common/v3/play*',
    'http://tv.api.3g.youku.com/openapi-wireless/v3/play/address*',
    'http://tv.api.3g.youku.com/common/v3/hasadv/play*',
    'http://tv.api.3g.youku.com/common/v3/play*',
    'http://play.api.3g.youku.com/common/v3/hasadv/play*',
    'http://play.api.3g.youku.com/common/v3/play*',
    'http://play.api.3g.youku.com/v3/play/address*',
    'http://play.api.3g.tudou.com/v*',
    'http://tv.api.3g.tudou.com/tv/play?*',
    'http://api.3g.tudou.com/*',
    'http://api.tv.sohu.com/mobile_user/device/clientconf.json?*',
    'http://access.tv.sohu.com/*',
    'http://iface.iqiyi.com/api/searchIface?*',
    'http://iface2.iqiyi.com/php/xyz/iface/*',
    'http://iface2.iqiyi.com/php/xyz/entry/galaxy.php?*',
    'http://iface2.iqiyi.com/php/xyz/entry/nebula.php?*',
    'http://cache.m.iqiyi.com/jp/tmts/*',
    'http://dynamic.app.m.letv.com/*/dynamic.php?*ctl=videofile*',
    'http://dynamic.meizi.app.m.letv.com/*/dynamic.php?*ctl=videofile*',
    'http://dynamic.search.app.m.letv.com/*/dynamic.php?*ctl=videofile*',
    'http://dynamic.live.app.m.letv.com/*/dynamic.php?*act=canplay*',
    'http://listso.m.areainfo.ppstream.com/ip/q.php*',
    'http://epg.api.pptv.com/detail.api?*',
    'http://play.api.pptv.com/boxplay.api?*',
    'http://api.letv.com/getipgeo',
    'http://m.letv.com/api/geturl?*',
    'http://interface.bilibili.com/playurl?*',
    'http://vdn.live.cntv.cn/api2/live.do?channel=pa://cctv_p2p_hdcctv5*',
    'http://vdn.apps.cntv.cn/api/getLiveUrlCommonApi.do?pa://cctv_p2p_hdcctv5*',
    'http://vdn.live.cntv.cn/api2/live.do?channel=pa://cctv_p2p_hdcctv6*',
    'http://vdn.apps.cntv.cn/api/getLiveUrlCommonApi.do?pa://cctv_p2p_hdcctv6*',
    'http://vdn.live.cntv.cn/api2/live.do?channel=pa://cctv_p2p_hdcctv8*',
    'http://vdn.apps.cntv.cn/api/getLiveUrlCommonApi.do?pa://cctv_p2p_hdcctv8*',
    'http://vdn.live.cntv.cn/api2/live.do?channel=pa://cctv_p2p_hdbtv6*',
    'http://vdn.apps.cntv.cn/api/getLiveUrlCommonApi.do?pa://cctv_p2p_hdbtv6*',

    // Music apps
    'http://3g.music.qq.com/*',
    'http://mqqplayer.3g.qq.com/*',
    'http://proxy.music.qq.com/*',
    'http://proxymc.qq.com/*',
    'http://ip2.kugou.com/check/isCn/*',
    'http://ip.kugou.com/check/isCn/*',
    'http://client.api.ttpod.com/global*',
    'http://mobi.kuwo.cn/*',
    'http://mobilefeedback.kugou.com/*',
    'http://tingapi.ting.baidu.com/v1/restserver/ting?*method=baidu.ting.song*',
    'http://music.baidu.com/data/music/links?*',
    'http://serviceinfo.sdk.duomi.com/api/serviceinfo/getserverlist*',
    'http://music.163.com/api/copyright/restrict/?*',
    'http://music.163.com/api/batch',
    'http://www.xiami.com/web/spark*',
    'http://www.xiami.com/web/*?*xiamitoken=*',
    'http://spark.api.xiami.com/api?*method=AuthIp*',
    'http://spark.api.xiami.com/api?*method=Start.init*',
    'http://spark.api.xiami.com/api?*method=Songs.getTrackDetail*',
    'http://spark.api.xiami.com/api?*method=Songs.detail*',
    // for PC Clients only
    'http://iplocation.geo.qiyi.com/cityjson',
    'http://sns.video.qq.com/tunnel/fcgi-bin/tunnel*',
    'http://v5.pc.duomi.com/single-ajaxsingle-isban*',

    // the access control for https are per domain name
    'https://openapi.youku.com/*',  // see issue #118
    'https://61.135.196.99/*', //n-openapi.youku.com
    'https://220.181.185.150/*', //zw-openapi.youku.com
    'https://111.13.127.46/*',//bj-m-openapi.youku.com
    'https://211.151.50.10/*',//b-openapi.youku.com
    'https://123.126.99.57/*',//openapi.youku.com
    'https://123.126.99.39/*',//zw-n-openapi.youku.com
    'https://220.181.154.137/*',//zw-t-openapi.youku.com

    'https://httpbin.org/*',  // for testing

    // for MiBox iCNTV Authentication
    'http://tms.is.ysten.com:8080/yst-tms/login.action?*',
    'http://chrome.2345.com/dianhua/mobileApi/check.php',
    'http://internal.check.duokanbox.com/check.json*',
    // for 3rd party's DNS for Apple TV (see pull request #78)
    'http://180.153.225.136/*',
    'http://118.244.244.124/*',
    'http://210.129.145.150/*',
    'http://182.16.230.98/*' //Updated on Jan. 3, for new DNS of apple tv.
];


function urls2regexs(url_list) {
    "use strict";

    var regex_list = [];

    var i, re_str;
    for (i = 0; i < url_list.length; i++) {
        re_str = url_list[i];
        // escape all possibly problematic symbols
        // http://stackoverflow.com/a/6969486/1766096
        re_str = re_str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&');
        re_str = re_str.replace(/\*/g, '.*');
        // make the first * matches only domain names or ip addresses
        // just as http://developer.chrome.com/extensions/match_patterns.html
        re_str = re_str.replace(/^http:\\\/\\\/\.\*/i, 'http:\\/\\/[^\/]*');
        re_str = re_str.replace(/^https:\\\/\\\/\.\*/i, 'https:\\/\\/[^\/]*');
        regex_list.push(new RegExp('^' + re_str + '$', 'i'));
    }

    // console.log(regex_list);
    return regex_list;
}


function produce_regex_list(for_pac_server) {
    var squid_url_list = unblock_youku.common_urls.concat(
        unblock_youku.chrome_extra_urls
    );
    if (for_pac_server === true) {
        squid_url_list = squid_url_list.concat(
            unblock_youku.server_extra_urls
        );
    }

    var squid_regex_list = urls2regexs(squid_url_list);
    var i, single_str;

    var ret_list = [];
    for (i = 0; i < squid_regex_list.length; i++) {
        single_str = squid_regex_list[i].toString();
        ret_list.push(single_str.substring(1, single_str.length - 2));
    }

    return ret_list;
}


// also export as a node.js module
var exports = exports || {};
exports.urls2regexs = urls2regexs;
exports.url_list = unblock_youku.common_urls.concat(unblock_youku.server_extra_urls);
exports.crx_url_list = unblock_youku.common_urls.concat(unblock_youku.chrome_extra_urls);
exports.url_regex_list = urls2regexs(exports.url_list);
exports.url_whitelist = unblock_youku.server_whitelist_urls;
exports.url_regex_whitelist = urls2regexs(exports.url_whitelist);
exports.produce_regex_list = produce_regex_list;


(function() {
    // http://stackoverflow.com/a/5197219
    // http://stackoverflow.com/a/6398335
    if (typeof module !== 'undefined' && module.exports && require.main === module) {
        var squid_regex_list;
        if (typeof process !== 'undefined' && process.argv[2] === 'server') {
            squid_regex_list = produce_regex_list(true);
        } else {
            squid_regex_list = produce_regex_list(false);
        }

        for (var i = 0; i < squid_regex_list.length; i++) {
            console.log(squid_regex_list[i]);
        }
    }
}());
