var unblock_youku = {};  // namespace


// url filter settings
unblock_youku.general_url_list = [
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
    'http://zb.s.qq.com/*',
    'http://ip.kankan.xunlei.com/*',

    'http://v.youku.com/player/*',
    'http://v.iask.com/v_play.php*'
];


unblock_youku.normal_url_list = unblock_youku.general_url_list.concat(['http://*.gougou.com/*']);
unblock_youku.proxy_pac_content = url2pac(unblock_youku.normal_url_list);
// console.log('pac_content:\n' +  unblock_youku.proxy_pac_content);


unblock_youku.redirect_url_list = unblock_youku.general_url_list;


function url2pac(url_list) {
    var s = '';

    var hostname;
    for (var i = 0; i < url_list.length; i++) {
        hostname = url_list[i].match(/:\/\/(.[^\/]+)/)[1];
        if (url_list[i].length - 9 > hostname.length ||
                url_list[i].split('*').length - 1 > 1)   // http://goo.gl/qGQw9
            s += 'shExpMatch(url, "' + url_list[i] + '")';
        else
            s += 'host === "' + hostname + '"';

        if (i < url_list.length - 1)
            s += '\t\t||\n';
    }

    return s;
}


// mode settings
function current_mode() {
    if (!localStorage.unblock_youku_mode)
        localStorage.unblock_youku_mode = 'normal';

    return localStorage.unblock_youku_mode;
}


function change_mode(mode_name) {
    switch (mode_name) {
    case 'lite':
        clear_proxy();
        localStorage.unblock_youku_mode = 'lite';
        break;
    case 'redirect':
        clear_proxy();
        localStorage.unblock_youku_mode = 'redirect';
        break;
    default:
        setup_proxy();
        localStorage.unblock_youku_mode = 'normal';
        break;
    }
    console.log('changed mode to: ' + mode_name);
}


// preconfiguration settings
unblock_youku.ip_addr  = '114.114.';
unblock_youku.ip_addr += Math.floor(Math.random() * 255) + '.';
unblock_youku.ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
console.log('faked ip addr: ' + unblock_youku.ip_addr);

unblock_youku.sogou_auth = '/30/853edc6d49ba4e27';
(function () {
    var tmp_str;
    for (var i = 0; i < 8; i++) {
        tmp_str = ('0000' + Math.floor(Math.random() * 65536).toString(16)).slice(-4);
            unblock_youku.sogou_auth = tmp_str.toUpperCase() + unblock_youku.sogou_auth;
    }
    console.log('sogou_auth: ' + unblock_youku.sogou_auth);
})();

