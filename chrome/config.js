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


unblock_youku.default_server = 'yo.uku.im/proxy.php';  // default backend server for redirect mode


unblock_youku.normal_url_list = unblock_youku.url_list.concat([
    //'http://shop.xunlei.com/*',
    'http://ting.baidu.com/data/music/songlink*',
    'http://ting.baidu.com/data/music/songinfo*',
    'http://ting.baidu.com/song/*/download*',
    'http://*.gougou.com/*'
]);
unblock_youku.redirect_url_list = unblock_youku.url_list;


// ip & id settings
unblock_youku.ip_addr = new_random_ip();
console.log('ip addr: ' + unblock_youku.ip_addr);
unblock_youku.sogou_auth = new_sogou_auth_str();
console.log('sogou_auth: ' + unblock_youku.sogou_auth);


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
    var old_mode = get_current_mode();
    if (new_mode === old_mode)
        return;

    // clear old settings
    switch (old_mode) {
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

    // track mode changes
    _gaq.push(['_trackEvent', 'Change Mode', old_mode + ' -> ' + new_mode]);
}


(function () {
    var xhr = new XMLHttpRequest();
    var url = chrome.extension.getURL('manifest.json');
    xhr.open('GET', url, false);  // blocking
    xhr.send();

    var manifest = JSON.parse(xhr.responseText);
    unblock_youku.version = manifest.version;
    console.log('version: ' + unblock_youku.version);
})();


function init_unblock_youku() {
    init_current_mode();

    _gaq.push(['_trackEvent', 'Init Mode', get_current_mode()]);
    _gaq.push(['_trackEvent', 'Version', unblock_youku.version]);
}


// set up mode settings when chrome starts
document.addEventListener("DOMContentLoaded", init_unblock_youku);

