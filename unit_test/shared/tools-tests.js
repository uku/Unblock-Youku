import { expect } from 'chai';
import tools from '../../shared/tools';

const test_urls = [
    'http://v.youku.com/player/*',
    'http://api.youku.com/player/*',
    'http://play.youku.com/play/get.json*',
    // 'http://v2.tudou.com/*',
    'http://www.tudou.com/a/*',
    'http://www.tudou.com/v/*',
    'http://www.tudou.com/outplay/goto/*',
    'http://www.tudou.com/tvp/alist.action*',
    'http://s.plcloud.music.qq.com/fcgi-bin/p.fcg*',
    'http://i.y.qq.com/s.plcloud/fcgi-bin/p.fcg*',
    'http://hot.vrs.sohu.com/*',
    'http://live.tv.sohu.com/live/player*',
    'http://pad.tv.sohu.com/playinfo*',
    'http://my.tv.sohu.com/play/m3u8version.do*',
    'http://hot.vrs.letv.com/*',
    // 'http://g3.letv.cn/*',
    'http://data.video.qiyi.com/v.*',
    'http://data.video.qiyi.com/videos/*',
    'http://data.video.qiyi.com/*/videos/*',
    // 'http://nl.rcd.iqiyi.com/apis/urc/*',
    'http://cache.video.qiyi.com/vms?*',
    'http://cache.vip.qiyi.com/vms?*',
    'http://cache.video.qiyi.com/vp/*/*/?src=*',
    'http://cache.video.qiyi.com/vps?*',
    'http://cache.video.qiyi.com/liven/*',
    'http://iplocation.geo.qiyi.com/cityjson*',
    'http://*.cupid.iqiyi.com/*',
    'http://v.api.hunantv.com/player/video*',
    'http://acc.music.qq.com/base/fcgi-bin/getsession*',

    'http://api.appsdk.soku.com/d/s?keyword=*',
    'http://api.appsdk.soku.com/u/s?keyword=*',

    // cause oversea servers unusable?
    // 'http://interface.bilibili.tv/player*',
    'http://app.bilibili.com/bangumi/user_season_status?*',
    'http://bangumi.bilibili.com/api/*',

    'http://122.72.82.31/*',

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
    'http://info.zb.video.qq.com/?*',
    'http://qzs.qq.com/tencentvideo_v1/*',
    'http://ac.qq.com/Comic/comicInfo/id/*',

    'http://geo.js.kankan.xunlei.com/*',
    'http://web-play.pptv.com/*',
    'http://web-play.pplive.cn/*',
    'http://tools.aplusapi.pptv.com/get_ppi?*',
    'http://live.pptv.com/api/subject_list?*',
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
    // 'http://ting.baidu.com/data/music/songlink*',
    // 'http://ting.baidu.com/data/music/songinfo*',
    // 'http://ting.baidu.com/song/*/download*',
    'http://music.sina.com.cn/radio/port/webFeatureRadioLimitList.php*',
    'http://play.baidu.com/data/music/songlink*',

    'http://v.iask.com/v_play.php*',
    'http://v.iask.com/v_play_ipad.cx.php*',
    'http://tv.weibo.com/player/*',
    'http://wtv.v.iask.com/*.m3u8*',
    'http://wtv.v.iask.com/mcdn.php',
    'http://video.sina.com.cn/interface/l/u/getFocusStatus.php*',
    'http://wtv.v.iask.com/player/ovs1_idc_list.php*',

    // 'http://kandian.com/player/getEpgInfo*',  // !!!
    // 'http://cdn.kandian.com/*',
    'http://www.yinyuetai.com/insite/*',
    'http://www.yinyuetai.com/main/get-*',
    'http://www.xiami.com/play?*',

    'http://*.dpool.sina.com.cn/iplookup*',
    // 'http://*/vrs_flash.action*', //This URL hijackable!
    // 'http://*/?prot=2&type=1*',
    // 'http://*/?prot=2&file=/*',
    'http://api.letv.com/streamblock*',
    'http://api.letv.com/mms/out/video/play*',
    'http://api.letv.com/mms/out/common/geturl*',
    'http://api.letv.com/geturl*',
    'http://api.letv.com/api/geturl*',
    'http://api.www.letv.com/mms/out/video/playJson?*',
    'http://st.live.letv.com/live/*',
    'http://live.gslb.letv.com/gslb?*',
    'http://live.g3proxy.lecloud.com/gslb?*',
    'http://api.live.letv.com/crossdomain.xml',
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
    'http://211.151.157.15/*',
    'http://www.tudou.com/programs/view/*',
    'http://www.tudou.com/albumplay/*',
    'http://www.tudou.com/listplay/*',

    'http://www.youku.com/show_page/*',
    'http://v.youku.com/v_show/*',
    'http://www.soku.com/search_video/*',

    'http://douban.fm/',  // without *

    // 'http://live.video.sina.com.cn/room/*',
    // 'http://edge.v.iask.com/*',  // may be large files

    'http://pay.youku.com/buy/redirect.html*',
    'http://pay.tudou.com/buy/redirect.html*',
    'http://aid.video.qq.com/fcgi-bin/userip?*',
    'http://aidbak.video.qq.com/fcgi-bin/userip?*',
    'http://pay.video.qq.com/fcgi-bin/paylimit*',
    'http://paybak.video.qq.com/fcgi-bin/paylimit*',
    'http://chrome.2345.com/dianhua/index.php?m=call&f=check&*'
];
const expected_pac = `var _http_map = {
  'white': {
    'any': []
  },
  'proxy': {
    'any': [
      /^[^/]*\\.cupid\\.iqiyi\\.com\\//i,
      /^[^/]*\\.dpool\\.sina\\.com\\.cn\\/iplookup/i
    ],
    'v.youku.com': [
      /^\\/player\\//i,
      /^\\/v_show\\//i
    ],
    'api.youku.com': [
      /^\\/player\\//i
    ],
    'play.youku.com': [
      /^\\/play\\/get\\.json/i
    ],
    'www.tudou.com': [
      /^\\/a\\//i,
      /^\\/v\\//i,
      /^\\/outplay\\/goto\\//i,
      /^\\/tvp\\/alist\\.action/i,
      /^\\/programs\\/view\\//i,
      /^\\/albumplay\\//i,
      /^\\/listplay\\//i
    ],
    's.plcloud.music.qq.com': [
      /^\\/fcgi\\-bin\\/p\\.fcg/i
    ],
    'i.y.qq.com': [
      /^\\/s\\.plcloud\\/fcgi\\-bin\\/p\\.fcg/i
    ],
    'hot.vrs.sohu.com': [
      /^\\//i
    ],
    'live.tv.sohu.com': [
      /^\\/live\\/player/i
    ],
    'pad.tv.sohu.com': [
      /^\\/playinfo/i
    ],
    'my.tv.sohu.com': [
      /^\\/play\\/m3u8version\\.do/i
    ],
    'hot.vrs.letv.com': [
      /^\\//i
    ],
    'data.video.qiyi.com': [
      /^\\/v\\./i,
      /^\\/videos\\//i,
      /^\\/.*\\/videos\\//i
    ],
    'cache.video.qiyi.com': [
      /^\\/vms\\?/i,
      /^\\/vp\\/.*\\/.*\\/\\?src=/i,
      /^\\/vps\\?/i,
      /^\\/liven\\//i
    ],
    'cache.vip.qiyi.com': [
      /^\\/vms\\?/i
    ],
    'iplocation.geo.qiyi.com': [
      /^\\/cityjson/i
    ],
    'v.api.hunantv.com': [
      /^\\/player\\/video/i
    ],
    'acc.music.qq.com': [
      /^\\/base\\/fcgi\\-bin\\/getsession/i
    ],
    'api.appsdk.soku.com': [
      /^\\/d\\/s\\?keyword=/i,
      /^\\/u\\/s\\?keyword=/i
    ],
    'app.bilibili.com': [
      /^\\/bangumi\\/user_season_status\\?/i
    ],
    'bangumi.bilibili.com': [
      /^\\/api\\//i
    ],
    '122.72.82.31': [
      /^\\//i
    ],
    'vv.video.qq.com': [
      /^\\//i,
      /^\\/getvinfo/i,
      /^\\/getinfo/i,
      /^\\/geturl/i
    ],
    'tt.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'ice.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'tjsa.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'a10.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'xyy.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'vcq.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'vsh.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'vbj.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'bobo.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'flvs.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'bkvv.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'info.zb.qq.com': [
      /^\\/\\?/i
    ],
    'info.zb.video.qq.com': [
      /^\\/\\?/i
    ],
    'qzs.qq.com': [
      /^\\/tencentvideo_v1\\//i
    ],
    'ac.qq.com': [
      /^\\/Comic\\/comicInfo\\/id\\//i
    ],
    'geo.js.kankan.xunlei.com': [
      /^\\//i
    ],
    'web-play.pptv.com': [
      /^\\//i
    ],
    'web-play.pplive.cn': [
      /^\\//i
    ],
    'tools.aplusapi.pptv.com': [
      /^\\/get_ppi\\?/i
    ],
    'live.pptv.com': [
      /^\\/api\\/subject_list\\?/i
    ],
    'dyn.ugc.pps.tv': [
      /^\\//i
    ],
    'v.pps.tv': [
      /^\\/ugc\\/ajax\\/aj_html5_url\\.php/i
    ],
    'inner.kandian.com': [
      /^\\//i
    ],
    'ipservice.163.com': [
      /^\\//i
    ],
    'so.open.163.com': [
      /^\\/open\\/info\\.htm/i
    ],
    'zb.s.qq.com': [
      /^\\//i
    ],
    'ip.kankan.xunlei.com': [
      /^\\//i
    ],
    'vxml.56.com': [
      /^\\/json\\//i
    ],
    'music.sina.com.cn': [
      /^\\/yueku\\/intro\\//i,
      /^\\/radio\\/port\\/webFeatureRadioLimitList\\.php/i
    ],
    'play.baidu.com': [
      /^\\/data\\/music\\/songlink/i
    ],
    'v.iask.com': [
      /^\\/v_play\\.php/i,
      /^\\/v_play_ipad\\.cx\\.php/i
    ],
    'tv.weibo.com': [
      /^\\/player\\//i
    ],
    'wtv.v.iask.com': [
      /^\\/.*\\.m3u8/i,
      /^\\/mcdn\\.php$/i,
      /^\\/player\\/ovs1_idc_list\\.php/i
    ],
    'video.sina.com.cn': [
      /^\\/interface\\/l\\/u\\/getFocusStatus\\.php/i
    ],
    'www.yinyuetai.com': [
      /^\\/insite\\//i,
      /^\\/main\\/get\\-/i
    ],
    'www.xiami.com': [
      /^\\/play\\?/i
    ],
    'api.letv.com': [
      /^\\/streamblock/i,
      /^\\/mms\\/out\\/video\\/play/i,
      /^\\/mms\\/out\\/common\\/geturl/i,
      /^\\/geturl/i,
      /^\\/api\\/geturl/i
    ],
    'api.www.letv.com': [
      /^\\/mms\\/out\\/video\\/playJson\\?/i
    ],
    'st.live.letv.com': [
      /^\\/live\\//i
    ],
    'live.gslb.letv.com': [
      /^\\/gslb\\?/i
    ],
    'live.g3proxy.lecloud.com': [
      /^\\/gslb\\?/i
    ],
    'api.live.letv.com': [
      /^\\/crossdomain\\.xml$/i
    ],
    'static.itv.letv.com': [
      /^\\/api/i
    ],
    'ip.apps.cntv.cn': [
      /^\\/js\\/player\\.do/i
    ],
    'vdn.apps.cntv.cn': [
      /^\\/api\\/get/i
    ],
    'vdn.live.cntv.cn': [
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdcctv5/i,
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdcctv6/i,
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdcctv8/i,
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdbtv6/i
    ],
    'vip.sports.cntv.cn': [
      /^\\/check\\.do/i,
      /^\\/play\\.do/i,
      /^\\/servlets\\/encryptvideopath\\.do/i
    ],
    '211.151.157.15': [
      /^\\//i
    ],
    'www.youku.com': [
      /^\\/show_page\\//i
    ],
    'www.soku.com': [
      /^\\/search_video\\//i
    ],
    'douban.fm': [
      /^\\/$/i
    ],
    'pay.youku.com': [
      /^\\/buy\\/redirect\\.html/i
    ],
    'pay.tudou.com': [
      /^\\/buy\\/redirect\\.html/i
    ],
    'aid.video.qq.com': [
      /^\\/fcgi\\-bin\\/userip\\?/i
    ],
    'aidbak.video.qq.com': [
      /^\\/fcgi\\-bin\\/userip\\?/i
    ],
    'pay.video.qq.com': [
      /^\\/fcgi\\-bin\\/paylimit/i
    ],
    'paybak.video.qq.com': [
      /^\\/fcgi\\-bin\\/paylimit/i
    ],
    'chrome.2345.com': [
      /^\\/dianhua\\/index\\.php\\?m=call&f=check&/i
    ]
  }
};
var _https_map = {
  'white': {
    'any': []
  },
  'proxy': {
    'any': []
  }
};
var _proxy_str = 'HTTPS secure.uku.im:993; PROXY proxy.uku.im:443; DIRECT;';

function _check_regex_list(regex_list, str) {
  var i;
  for (i = 0; i < regex_list.length; i++)
    if (regex_list[i].test(str))
      return true;
  return false;
}

function _check_patterns(patterns, hostname, full_url, prot_len) {
  if (patterns.hasOwnProperty(hostname))
    if (_check_regex_list(patterns[hostname],
        full_url.slice(prot_len + hostname.length)))
      return true;
  if (_check_regex_list(patterns.any,
      full_url.slice(prot_len)))
    return true;
  return false;
}

function _find_proxy(url_map, host, url, prot_len) {
  if (_check_patterns(url_map.white, host, url, prot_len))
      return 'DIRECT';
  if (_check_patterns(url_map.proxy, host, url, prot_len))
    return _proxy_str;
  return 'DIRECT';
}

function FindProxyForURL(url, host) {
  var prot = url.slice(0, 6);
  if (prot === 'http:/')
    return _find_proxy(_http_map, host, url, 7);
  else if (prot === 'https:')
    return _find_proxy(_https_map, host, url, 8);
  return 'DIRECT';
}
`;

const expected_map = `{
  'white': {
    'any': []
  },
  'proxy': {
    'any': [
      /^[^/]*\\.cupid\\.iqiyi\\.com\\//i,
      /^[^/]*\\.dpool\\.sina\\.com\\.cn\\/iplookup/i
    ],
    'v.youku.com': [
      /^\\/player\\//i,
      /^\\/v_show\\//i
    ],
    'api.youku.com': [
      /^\\/player\\//i
    ],
    'play.youku.com': [
      /^\\/play\\/get\\.json/i
    ],
    'www.tudou.com': [
      /^\\/a\\//i,
      /^\\/v\\//i,
      /^\\/outplay\\/goto\\//i,
      /^\\/tvp\\/alist\\.action/i,
      /^\\/programs\\/view\\//i,
      /^\\/albumplay\\//i,
      /^\\/listplay\\//i
    ],
    's.plcloud.music.qq.com': [
      /^\\/fcgi\\-bin\\/p\\.fcg/i
    ],
    'i.y.qq.com': [
      /^\\/s\\.plcloud\\/fcgi\\-bin\\/p\\.fcg/i
    ],
    'hot.vrs.sohu.com': [
      /^\\//i
    ],
    'live.tv.sohu.com': [
      /^\\/live\\/player/i
    ],
    'pad.tv.sohu.com': [
      /^\\/playinfo/i
    ],
    'my.tv.sohu.com': [
      /^\\/play\\/m3u8version\\.do/i
    ],
    'hot.vrs.letv.com': [
      /^\\//i
    ],
    'data.video.qiyi.com': [
      /^\\/v\\./i,
      /^\\/videos\\//i,
      /^\\/.*\\/videos\\//i
    ],
    'cache.video.qiyi.com': [
      /^\\/vms\\?/i,
      /^\\/vp\\/.*\\/.*\\/\\?src=/i,
      /^\\/vps\\?/i,
      /^\\/liven\\//i
    ],
    'cache.vip.qiyi.com': [
      /^\\/vms\\?/i
    ],
    'iplocation.geo.qiyi.com': [
      /^\\/cityjson/i
    ],
    'v.api.hunantv.com': [
      /^\\/player\\/video/i
    ],
    'acc.music.qq.com': [
      /^\\/base\\/fcgi\\-bin\\/getsession/i
    ],
    'api.appsdk.soku.com': [
      /^\\/d\\/s\\?keyword=/i,
      /^\\/u\\/s\\?keyword=/i
    ],
    'app.bilibili.com': [
      /^\\/bangumi\\/user_season_status\\?/i
    ],
    'bangumi.bilibili.com': [
      /^\\/api\\//i
    ],
    '122.72.82.31': [
      /^\\//i
    ],
    'vv.video.qq.com': [
      /^\\//i,
      /^\\/getvinfo/i,
      /^\\/getinfo/i,
      /^\\/geturl/i
    ],
    'tt.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'ice.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'tjsa.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'a10.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'xyy.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'vcq.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'vsh.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'vbj.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'bobo.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'flvs.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'bkvv.video.qq.com': [
      /^\\/getvinfo/i
    ],
    'info.zb.qq.com': [
      /^\\/\\?/i
    ],
    'info.zb.video.qq.com': [
      /^\\/\\?/i
    ],
    'qzs.qq.com': [
      /^\\/tencentvideo_v1\\//i
    ],
    'ac.qq.com': [
      /^\\/Comic\\/comicInfo\\/id\\//i
    ],
    'geo.js.kankan.xunlei.com': [
      /^\\//i
    ],
    'web-play.pptv.com': [
      /^\\//i
    ],
    'web-play.pplive.cn': [
      /^\\//i
    ],
    'tools.aplusapi.pptv.com': [
      /^\\/get_ppi\\?/i
    ],
    'live.pptv.com': [
      /^\\/api\\/subject_list\\?/i
    ],
    'dyn.ugc.pps.tv': [
      /^\\//i
    ],
    'v.pps.tv': [
      /^\\/ugc\\/ajax\\/aj_html5_url\\.php/i
    ],
    'inner.kandian.com': [
      /^\\//i
    ],
    'ipservice.163.com': [
      /^\\//i
    ],
    'so.open.163.com': [
      /^\\/open\\/info\\.htm/i
    ],
    'zb.s.qq.com': [
      /^\\//i
    ],
    'ip.kankan.xunlei.com': [
      /^\\//i
    ],
    'vxml.56.com': [
      /^\\/json\\//i
    ],
    'music.sina.com.cn': [
      /^\\/yueku\\/intro\\//i,
      /^\\/radio\\/port\\/webFeatureRadioLimitList\\.php/i
    ],
    'play.baidu.com': [
      /^\\/data\\/music\\/songlink/i
    ],
    'v.iask.com': [
      /^\\/v_play\\.php/i,
      /^\\/v_play_ipad\\.cx\\.php/i
    ],
    'tv.weibo.com': [
      /^\\/player\\//i
    ],
    'wtv.v.iask.com': [
      /^\\/.*\\.m3u8/i,
      /^\\/mcdn\\.php$/i,
      /^\\/player\\/ovs1_idc_list\\.php/i
    ],
    'video.sina.com.cn': [
      /^\\/interface\\/l\\/u\\/getFocusStatus\\.php/i
    ],
    'www.yinyuetai.com': [
      /^\\/insite\\//i,
      /^\\/main\\/get\\-/i
    ],
    'www.xiami.com': [
      /^\\/play\\?/i
    ],
    'api.letv.com': [
      /^\\/streamblock/i,
      /^\\/mms\\/out\\/video\\/play/i,
      /^\\/mms\\/out\\/common\\/geturl/i,
      /^\\/geturl/i,
      /^\\/api\\/geturl/i
    ],
    'api.www.letv.com': [
      /^\\/mms\\/out\\/video\\/playJson\\?/i
    ],
    'st.live.letv.com': [
      /^\\/live\\//i
    ],
    'live.gslb.letv.com': [
      /^\\/gslb\\?/i
    ],
    'live.g3proxy.lecloud.com': [
      /^\\/gslb\\?/i
    ],
    'api.live.letv.com': [
      /^\\/crossdomain\\.xml$/i
    ],
    'static.itv.letv.com': [
      /^\\/api/i
    ],
    'ip.apps.cntv.cn': [
      /^\\/js\\/player\\.do/i
    ],
    'vdn.apps.cntv.cn': [
      /^\\/api\\/get/i
    ],
    'vdn.live.cntv.cn': [
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdcctv5/i,
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdcctv6/i,
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdcctv8/i,
      /^\\/api2\\/liveHtml5\\.do\\?channel=pa:\\/\\/cctv_p2p_hdbtv6/i
    ],
    'vip.sports.cntv.cn': [
      /^\\/check\\.do/i,
      /^\\/play\\.do/i,
      /^\\/servlets\\/encryptvideopath\\.do/i
    ],
    '211.151.157.15': [
      /^\\//i
    ],
    'www.youku.com': [
      /^\\/show_page\\//i
    ],
    'www.soku.com': [
      /^\\/search_video\\//i
    ],
    'douban.fm': [
      /^\\/$/i
    ],
    'pay.youku.com': [
      /^\\/buy\\/redirect\\.html/i
    ],
    'pay.tudou.com': [
      /^\\/buy\\/redirect\\.html/i
    ],
    'aid.video.qq.com': [
      /^\\/fcgi\\-bin\\/userip\\?/i
    ],
    'aidbak.video.qq.com': [
      /^\\/fcgi\\-bin\\/userip\\?/i
    ],
    'pay.video.qq.com': [
      /^\\/fcgi\\-bin\\/paylimit/i
    ],
    'paybak.video.qq.com': [
      /^\\/fcgi\\-bin\\/paylimit/i
    ],
    'chrome.2345.com': [
      /^\\/dianhua\\/index\\.php\\?m=call&f=check&/i
    ]
  }
}`;

describe('shared/tools', () => {
    describe('#new_random_ip()', () => {
        it('should return ip address in 220.181.111.(1-254)', () => {
            Array.apply(null, { length: 500 }).map(() => {
                const test_ip = tools.new_random_ip();
                const result = /^220\.181\.111\.([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-4])$/
                    .test(test_ip);
                expect(result).to.be.true;
            });
        });
    });

    describe('#string_starts_with()', () => {
        it('should check if string starts with substring', () => {
            let test_str = 'http://example.com';
            let test_substr = 'http://';
            expect(tools.string_starts_with(test_str, test_substr)).to.be.true;

            test_str = 'htt://example.com';
            expect(tools.string_starts_with(test_str, test_substr)).to.be.false;

            test_str = 'http://example.com';
            test_substr = 'https://';
            expect(tools.string_starts_with(test_str, test_substr)).to.be.false;

            test_str = 'https://example.com';
            test_substr = 'https://';
            expect(tools.string_starts_with(test_str, test_substr)).to.be.true;

            test_str = 'https://example.com';
            test_substr = 'http://';
            expect(tools.string_starts_with(test_str, test_substr)).to.be.false;
        });
    });

    describe('#gen_url_map()', () => {
        it('should return correct url map', () => {
            const test_args = [
                'http',
                [],
                test_urls
            ];
            expect(tools.gen_url_map.apply(null, test_args)).to.equal(expected_map);
        });
    });

    describe('#urls2pac()', () => {
        it('should construct correct pac from urls', () => {
            const test_args = [
                [],
                test_urls,
                'secure.uku.im:993',
                'HTTPS', 'proxy.uku.im:443',
                'HTTP'
            ];
            expect(tools.urls2pac.apply(null, test_args)).to.equal(expected_pac);
        });
    });

    describe('#to_title_case()', () => {
        it('should change string to title case', () => {
            let test_str = 'proxy-connection';
            let expected_str = 'Proxy-Connection';
            expect(tools.to_title_case(test_str)).to.equal(expected_str);

            test_str = 'user-agent';
            expected_str = 'User-Agent';
            expect(tools.to_title_case(test_str)).to.equal(expected_str);

            test_str = 'proxy connection';
            expected_str = 'Proxy Connection';
            expect(tools.to_title_case(test_str)).to.equal(expected_str);
        });
    });
});
