var unblock_youku = {};  // namespace


document.addEventListener("DOMContentLoaded", function() {
    unblock_youku.ip_addr  = '220.181.111.';
    unblock_youku.ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
    console.log('faked ip addr: ' + unblock_youku.ip_addr);

    unblock_youku.sogou_auth = '/30/853edc6d49ba4e27';
    var tmp_str;
    for (var i = 0; i < 8; i++) {
        tmp_str = ('0000' + Math.floor(Math.random() * 65536).toString(16)).slice(-4);
        unblock_youku.sogou_auth = tmp_str.toUpperCase() + unblock_youku.sogou_auth;
    }
    console.log('sogou_auth: ' + unblock_youku.sogou_auth);
});


chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        details.requestHeaders.push({
            name: 'X-Forwarded-For',
            value: unblock_youku.ip_addr
        });

        return {requestHeaders: details.requestHeaders};
    },

    {
        urls: [
            'http://*.xiami.com/*',  // xiami is blocked in HK and TW
            'http://*.ku6.com/*'     // couldn't find ku6's sub-domain for checking ip, but this should already work
        ]
    },

    ['requestHeaders', 'blocking']);
// first addListener ends here


chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        var timestamp = Math.round(details.timeStamp / 1000).toString(16);
        var target_host = details.url.match(/:\/\/(.[^\/]+)/)[1];
        var tag = compute_sogou_tag(timestamp + target_host + 'SogouExplorerProxy');

        console.log(timestamp + ' ' + target_host + ' ' + tag);

        details.requestHeaders.push({
            name: 'X-Sogou-Auth',
            value: unblock_youku.sogou_auth
        }, {
            name: 'X-Sogou-Timestamp',
            value: timestamp
        }, {
            name: 'X-Sogou-Tag',
            value: tag
        }, {
            name: 'X-Forwarded-For',
            value: unblock_youku.ip_addr
        }, {
            name: 'X-Real-IP',
            value: unblock_youku.ip_addr
        });

        return {requestHeaders: details.requestHeaders};
    },

    {
        urls: [
            'http://hot.vrs.sohu.com/*',
            'http://hot.vrs.letv.com/*',
            'http://data.video.qiyi.com/*',
            'http://vv.video.qq.com/*',
            'http://geo.js.kankan.xunlei.com/*',
            'http://v2.tudou.com/*',
            'http://web-play.pptv.com/*',
            'http://dyn.ugc.pps.tv/*',
            'http://s.plcloud.music.qq.com/*',
            'http://inner.kandian.com/*',
            'http://ipservice.163.com/*',

            'http://v.iask.com/v_play.php*',
            'http://v.youku.com/player/*',
            'http://*.gougou.com/*'
        ]
    },

    ['requestHeaders', 'blocking']);
// second addListener ends here


// based on http://xiaoxia.org/2011/03/10/depressed-research-about-sogou-proxy-server-authentication-protocol/
function compute_sogou_tag(s) {
    var total_len = s.length;
    var numb_iter = Math.floor(total_len / 4);
    var numb_left = total_len % 4;

    var hash = total_len;  // output hash tag

    for (var i = 0; i < numb_iter; i++) {
        low  = s.charCodeAt(4 * i + 1) * 256 + s.charCodeAt(4 * i);  // right most 16 bits in little-endian
        high = s.charCodeAt(4 * i + 3) * 256 + s.charCodeAt(4 * i + 2);  // left most

        hash += low;
        hash %= 0x100000000;
        hash ^= hash << 16;

        hash ^= high << 11;
        hash += hash >>> 11;
        hash %= 0x100000000;
    }

    switch (numb_left) {
    case 3:
        hash += (s.charCodeAt(total_len - 2) << 8) + s.charCodeAt(total_len - 3);
        hash %= 0x100000000;
        hash ^= hash << 16;
        hash ^= s.charCodeAt(total_len - 1) << 18;
        hash += hash >>> 11;
        hash %= 0x100000000;
        break;
    case 2:
        hash += (s.charCodeAt(total_len - 1) << 8) + s.charCodeAt(total_len - 2);
        hash %= 0x100000000;
        hash ^= hash << 11;
        hash += hash >>> 17;
        hash %= 0x100000000;
        break;
    case 1:
        hash += s.charCodeAt(total_len - 1);
        hash %= 0x100000000;
        hash ^= hash << 10;
        hash += hash >>> 1;
        hash %= 0x100000000;
        break;
    default:
        break;
    }

    hash ^= hash << 3;
    hash += hash >>> 5;
    hash %= 0x100000000;

    hash ^= hash << 4;
    hash += hash >>> 17;
    hash %= 0x100000000;

    hash ^= hash << 25;
    hash += hash >>> 6;
    hash %= 0x100000000;

    // learnt from http://stackoverflow.com/questions/6798111/bitwise-operations-on-32-bit-unsigned-ints
    hash = hash >>> 0;

    return ('00000000' + hash.toString(16)).slice(-8);
}
