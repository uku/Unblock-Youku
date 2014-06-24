// http://goo.gl/J72SWy
function shExpMatch(url, pattern) {
    pattern = pattern.replace(/\./g, '\\.');
    pattern = pattern.replace(/\*/g, '.*');
    pattern = pattern.replace(/\?/g, '.');
    var newRe = new RegExp('^'+pattern+'$');
    return newRe.test(url);
}

function old_FindProxyForURL(url, host) {
    if (shExpMatch(url, "http://v.youku.com/player/*") ||
            shExpMatch(url, "http://api.youku.com/player/*") ||
            shExpMatch(url, "http://v2.tudou.com/*") ||
            shExpMatch(url, "http://www.tudou.com/a/*") ||
            shExpMatch(url, "http://www.tudou.com/v/*") ||
            shExpMatch(url, "http://www.tudou.com/outplay/goto/getTvcCode*") ||
            shExpMatch(url, "http://www.tudou.com/tvp/alist.action*") ||
            shExpMatch(url, "http://s.plcloud.music.qq.com/fcgi-bin/p.fcg*") ||
            shExpMatch(url, "http://hot.vrs.sohu.com/*") ||
            shExpMatch(url, "http://live.tv.sohu.com/live/player*") ||
            shExpMatch(url, "http://pad.tv.sohu.com/playinfo*") ||
            shExpMatch(url, "http://my.tv.sohu.com/play/m3u8version.do*") ||
            shExpMatch(url, "http://hot.vrs.letv.com/*") ||
            shExpMatch(url, "http://data.video.qiyi.com/*") ||
            shExpMatch(url, "http://61.135.183.45/*") ||
            shExpMatch(url, "http://61.135.183.46/*") ||
            shExpMatch(url, "http://61.135.183.50/*") ||
            shExpMatch(url, "http://220.181.61.229/*") ||
            shExpMatch(url, "http://220.181.61.212/*") ||
            shExpMatch(url, "http://220.181.61.213/*") ||
            shExpMatch(url, "http://220.181.19.218/*") ||
            shExpMatch(url, "http://220.181.118.181/*") ||
            shExpMatch(url, "http://123.126.48.47/*") ||
            shExpMatch(url, "http://123.126.48.48/*") ||
            shExpMatch(url, "http://123.125.123.80/*") ||
            shExpMatch(url, "http://123.125.123.81/*") ||
            shExpMatch(url, "http://123.125.123.82/*") ||
            shExpMatch(url, "http://vv.video.qq.com/*") ||
            shExpMatch(url, "http://vv.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://vv.video.qq.com/getinfo*") ||
            shExpMatch(url, "http://vv.video.qq.com/geturl*") ||
            shExpMatch(url, "http://tt.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://ice.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://tjsa.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://a10.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://xyy.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://vcq.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://vsh.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://vbj.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://bobo.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://flvs.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://bkvv.video.qq.com/getvinfo*") ||
            shExpMatch(url, "http://rcgi.video.qq.com/report*") ||
            shExpMatch(url, "http://geo.js.kankan.xunlei.com/*") ||
            shExpMatch(url, "http://web-play.pptv.com/*") ||
            shExpMatch(url, "http://web-play.pplive.cn/*") ||
            shExpMatch(url, "http://dyn.ugc.pps.tv/*") ||
            shExpMatch(url, "http://v.pps.tv/ugc/ajax/aj_html5_url.php*") ||
            shExpMatch(url, "http://inner.kandian.com/*") ||
            shExpMatch(url, "http://ipservice.163.com/*") ||
            shExpMatch(url, "http://so.open.163.com/open/info.htm*") ||
            shExpMatch(url, "http://zb.s.qq.com/*") ||
            shExpMatch(url, "http://ip.kankan.xunlei.com/*") ||
            shExpMatch(url, "http://vxml.56.com/json/*") ||
            shExpMatch(url, "http://music.sina.com.cn/yueku/intro/*") ||
            shExpMatch(url, "http://music.sina.com.cn/radio/port/webFeatureRadioLimitList.php*") ||
            shExpMatch(url, "http://play.baidu.com/data/music/songlink*") ||
            shExpMatch(url, "http://v.iask.com/v_play.php*") ||
            shExpMatch(url, "http://v.iask.com/v_play_ipad.cx.php*") ||
            shExpMatch(url, "http://tv.weibo.com/player/*") ||
            shExpMatch(url, "http://wtv.v.iask.com/*.m3u8") ||
            shExpMatch(url, "http://wtv.v.iask.com/mcdn.php") ||
            shExpMatch(url, "http://video.sina.com.cn/interface/l/u/getFocusStatus.php*") ||
            shExpMatch(url, "http://www.yinyuetai.com/insite/*") ||
            shExpMatch(url, "http://www.yinyuetai.com/main/get-*") ||
            shExpMatch(url, "http://*.dpool.sina.com.cn/iplookup*") ||
            shExpMatch(url, "http://*/vrs_flash.action*") ||
            shExpMatch(url, "http://*/?prot=2&type=1*") ||
            shExpMatch(url, "http://*/?prot=2&file=/*") ||
            shExpMatch(url, "http://api.letv.com/streamblock*") ||
            shExpMatch(url, "http://api.letv.com/mms/out/video/play*") ||
            shExpMatch(url, "http://api.letv.com/mms/out/common/geturl*") ||
            shExpMatch(url, "http://api.letv.com/geturl*") ||
            shExpMatch(url, "http://live.gslb.letv.com/gslb?*") ||
            shExpMatch(url, "http://ip.apps.cntv.cn/js/player.do*") ||
            shExpMatch(url, "http://vdn.apps.cntv.cn/api/get*") ||
            shExpMatch(url, "http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdcctv5*") ||
            shExpMatch(url, "http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdcctv6*") ||
            shExpMatch(url, "http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdcctv8*") ||
            shExpMatch(url, "http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hdbtv6*") ||
            shExpMatch(url, "http://vip.sports.cntv.cn/check.do*") ||
            shExpMatch(url, "http://vip.sports.cntv.cn/play.do*") ||
            shExpMatch(url, "http://vip.sports.cntv.cn/servlets/encryptvideopath.do*") ||
            shExpMatch(url, "http://pay.youku.com/buy/redirect.html*") ||
            shExpMatch(url, "http://pay.tudou.com/buy/redirect.html*") ||
            shExpMatch(url, "http://aid.video.qq.com/fcgi-bin/userip?*") ||
            shExpMatch(url, "http://pay.video.qq.com/fcgi-bin/paylimit*") ||
            shExpMatch(url, "http://chrome.2345.com/dianhua/index.php?m=call&f=check&*")) {
        return "PROXY proxy.mainland.io:8888";
    }
    return "DIRECT";
} 



// =================



var _http_map = {
  'white': {
    'any': []
  },
  'proxy': {
    'any': [
      /^[^/]*\.dpool\.sina\.com\.cn\/iplookup.*$/i,
      /^[^/]*\/vrs_flash\.action.*$/i,
      /^[^/]*\/\?prot=2&type=1.*$/i,
      /^[^/]*\/\?prot=2&file=\/.*$/i
    ],
    'v.youku.com': [
      /^\/player\/.*$/i
    ],
    'api.youku.com': [
      /^\/player\/.*$/i
    ],
    'v2.tudou.com': [
      /^\/.*$/i
    ],
    'www.tudou.com': [
      /^\/a\/.*$/i,
      /^\/v\/.*$/i,
      /^\/outplay\/goto\/getTvcCode.*$/i,
      /^\/tvp\/alist\.action.*$/i
    ],
    's.plcloud.music.qq.com': [
      /^\/fcgi\-bin\/p\.fcg.*$/i
    ],
    'hot.vrs.sohu.com': [
      /^\/.*$/i
    ],
    'live.tv.sohu.com': [
      /^\/live\/player.*$/i
    ],
    'pad.tv.sohu.com': [
      /^\/playinfo.*$/i
    ],
    'my.tv.sohu.com': [
      /^\/play\/m3u8version\.do.*$/i
    ],
    'hot.vrs.letv.com': [
      /^\/.*$/i
    ],
    'data.video.qiyi.com': [
      /^\/.*$/i
    ],
    'serv.vip.iqiyi.com': [
      /^\/services\/ck\.action.*$/i
    ],
    'cache.vip.qiyi.com': [
      /^\/vms\?.*$/i
    ],
    '61.135.183.45': [
      /^\/.*$/i
    ],
    '61.135.183.46': [
      /^\/.*$/i
    ],
    '61.135.183.50': [
      /^\/.*$/i
    ],
    '220.181.61.229': [
      /^\/.*$/i
    ],
    '220.181.61.212': [
      /^\/.*$/i
    ],
    '220.181.61.213': [
      /^\/.*$/i
    ],
    '220.181.19.218': [
      /^\/.*$/i
    ],
    '220.181.118.181': [
      /^\/.*$/i
    ],
    '123.126.48.47': [
      /^\/.*$/i
    ],
    '123.126.48.48': [
      /^\/.*$/i
    ],
    '123.125.123.80': [
      /^\/.*$/i
    ],
    '123.125.123.81': [
      /^\/.*$/i
    ],
    '123.125.123.82': [
      /^\/.*$/i
    ],
    'vv.video.qq.com': [
      /^\/.*$/i,
      /^\/getvinfo.*$/i,
      /^\/getinfo.*$/i,
      /^\/geturl.*$/i
    ],
    'tt.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'ice.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'tjsa.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'a10.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'xyy.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'vcq.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'vsh.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'vbj.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'bobo.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'flvs.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'bkvv.video.qq.com': [
      /^\/getvinfo.*$/i
    ],
    'rcgi.video.qq.com': [
      /^\/report.*$/i
    ],
    'geo.js.kankan.xunlei.com': [
      /^\/.*$/i
    ],
    'web-play.pptv.com': [
      /^\/.*$/i
    ],
    'web-play.pplive.cn': [
      /^\/.*$/i
    ],
    'dyn.ugc.pps.tv': [
      /^\/.*$/i
    ],
    'v.pps.tv': [
      /^\/ugc\/ajax\/aj_html5_url\.php.*$/i
    ],
    'inner.kandian.com': [
      /^\/.*$/i
    ],
    'ipservice.163.com': [
      /^\/.*$/i
    ],
    'so.open.163.com': [
      /^\/open\/info\.htm.*$/i
    ],
    'zb.s.qq.com': [
      /^\/.*$/i
    ],
    'ip.kankan.xunlei.com': [
      /^\/.*$/i
    ],
    'vxml.56.com': [
      /^\/json\/.*$/i
    ],
    'music.sina.com.cn': [
      /^\/yueku\/intro\/.*$/i,
      /^\/radio\/port\/webFeatureRadioLimitList\.php.*$/i
    ],
    'play.baidu.com': [
      /^\/data\/music\/songlink.*$/i
    ],
    'v.iask.com': [
      /^\/v_play\.php.*$/i,
      /^\/v_play_ipad\.cx\.php.*$/i
    ],
    'tv.weibo.com': [
      /^\/player\/.*$/i
    ],
    'wtv.v.iask.com': [
      /^\/.*\.m3u8$/i,
      /^\/mcdn\.php$/i
    ],
    'video.sina.com.cn': [
      /^\/interface\/l\/u\/getFocusStatus\.php.*$/i
    ],
    'www.yinyuetai.com': [
      /^\/insite\/.*$/i,
      /^\/main\/get\-.*$/i
    ],
    'api.letv.com': [
      /^\/streamblock.*$/i,
      /^\/mms\/out\/video\/play.*$/i,
      /^\/mms\/out\/common\/geturl.*$/i,
      /^\/geturl.*$/i
    ],
    'live.gslb.letv.com': [
      /^\/gslb\?.*$/i
    ],
    'ip.apps.cntv.cn': [
      /^\/js\/player\.do.*$/i
    ],
    'vdn.apps.cntv.cn': [
      /^\/api\/get.*$/i
    ],
    'vdn.live.cntv.cn': [
      /^\/api2\/liveHtml5\.do\?channel=pa:\/\/cctv_p2p_hdcctv5.*$/i,
      /^\/api2\/liveHtml5\.do\?channel=pa:\/\/cctv_p2p_hdcctv6.*$/i,
      /^\/api2\/liveHtml5\.do\?channel=pa:\/\/cctv_p2p_hdcctv8.*$/i,
      /^\/api2\/liveHtml5\.do\?channel=pa:\/\/cctv_p2p_hdbtv6.*$/i
    ],
    'vip.sports.cntv.cn': [
      /^\/check\.do.*$/i,
      /^\/play\.do.*$/i,
      /^\/servlets\/encryptvideopath\.do.*$/i
    ],
    'pay.youku.com': [
      /^\/buy\/redirect\.html.*$/i
    ],
    'pay.tudou.com': [
      /^\/buy\/redirect\.html.*$/i
    ],
    'aid.video.qq.com': [
      /^\/fcgi\-bin\/userip\?.*$/i
    ],
    'pay.video.qq.com': [
      /^\/fcgi\-bin\/paylimit.*$/i
    ],
    'chrome.2345.com': [
      /^\/dianhua\/index\.php\?m=call&f=check&.*$/i
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
var _proxy_str = 'PROXY localhost:8888';

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

function new_FindProxyForURL(url, host) {
  var prot = url.slice(0, 6);
  if (prot === 'http:/')
    return _find_proxy(_http_map, host, url, 7);
  else if (prot === 'https:')
    return _find_proxy(_https_map, host, url, 8);
  return 'DIRECT';
}

function performance(func, url, host) {
    var start = +new Date();
    for (var i = 0; i < 10000; i++) {
        func(url, host);
    }
    var end =  +new Date();
    return end - start;
}

var url;
var host;

url = 'http://www.google.com/search?{google:acceptedSuggestion}oq=test&sourceid=chrome&ie=UTF-8&q=test&qscrl=1';
host = 'www.google.com';
console.log(url);
console.log('Old:', performance(old_FindProxyForURL, url, host));
console.log('New:', performance(new_FindProxyForURL, url, host));
console.log();

url = 'https://www.google.com/search?{google:acceptedSuggestion}oq=test&sourceid=chrome&ie=UTF-8&q=test&qscrl=1';
host = 'www.google.com';
console.log(url);
console.log('Old:', performance(old_FindProxyForURL, url, host));
console.log('New:', performance(new_FindProxyForURL, url, host));
console.log();

url = 'http://v.youku.com/player/getPlayList/VideoIDS/XMzkzMzkzNDYw/timezone/-04/version/5/source/out?ran=6042&password=&n=3';
host = 'v.youku.com';
console.log(url);
console.log('Old:', performance(old_FindProxyForURL, url, host));
console.log('New:', performance(new_FindProxyForURL, url, host));
console.log();

url = 'http://v.youku.com/player/get';
host = 'v.youku.com';
console.log(url);
console.log('Old:', performance(old_FindProxyForURL, url, host));
console.log('New:', performance(new_FindProxyForURL, url, host));
console.log();
