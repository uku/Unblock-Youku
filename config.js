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


unblock_youku.normal_url_list = unblock_youku.general_url_list.concat([
    'http://shop.xunlei.com/*',
    'http://*.gougou.com/*'
]);
unblock_youku.proxy_pac_content = url2pac(unblock_youku.normal_url_list);
// console.log('pac_content:\n' +  unblock_youku.proxy_pac_content);


unblock_youku.redirect_url_list = unblock_youku.general_url_list;


// ip & id settings
// unblock_youku.ip_addr  = '114.114.';
unblock_youku.ip_addr  = '220.181.111.';
// unblock_youku.ip_addr += Math.floor(Math.random() * 255) + '.';
unblock_youku.ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
console.log('ip addr: ' + unblock_youku.ip_addr);

unblock_youku.sogou_auth = '/30/853edc6d49ba4e27';
(function () {
    var tmp_str;
    for (var i = 0; i < 8; i++) {
        tmp_str = ('0000' + Math.floor(Math.random() * 65536).toString(16)).slice(-4);
            unblock_youku.sogou_auth = tmp_str.toUpperCase() + unblock_youku.sogou_auth;
    }
    console.log('sogou_auth: ' + unblock_youku.sogou_auth);
})();


// functions
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


// mode setting functions
function get_current_mode() {
    if (!localStorage.unblock_youku_mode || (
            localStorage.unblock_youku_mode !== 'lite'    && 
            localStorage.unblock_youku_mode !== 'normal'  && 
            localStorage.unblock_youku_mode !== 'redirect'))
        localStorage.unblock_youku_mode = 'normal';

    return localStorage.unblock_youku_mode;
}


function set_current_mode(mode_name) {
    if (mode_name === 'lite' || mode_name === 'redirect')
        localStorage.unblock_youku_mode = mode_name;
    else
        localStorage.unblock_youku_mode = 'normal';
}


function init_current_mode() {
    switch (get_current_mode()) {
    case 'lite':
        setup_header();
        break;
    case 'redirect':
        setup_redirect();
        break;
    case 'normal':
        setup_header();
        setup_proxy();
        break;
    default:
        console.log('should never come here');
        break;
    }
    console.log('initialized the settings for the mode: ' + get_current_mode());
}


function change_mode(new_mode) {
    var current_mode = get_current_mode();
    if (new_mode === current_mode)
        return;

    // clear old settings
    switch (current_mode) {
    case 'lite':
        clear_header();
        console.log('cleared settings for lite');
        break;
    case 'redirect':
        clear_redirect();
        console.log('cleared settings for redirect');
        break;
    case 'normal':
        clear_proxy();
        clear_header();
        console.log('cleared settings for normal');
        break;
    default:
        console.log('should never come here');
        break;
    }

    // set up new settings
    set_current_mode(new_mode);
    init_current_mode();
}


// set up mode settings when chrome starts
document.addEventListener("DOMContentLoaded", init_current_mode);

