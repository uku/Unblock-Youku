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


// ====== Constant and Variable Settings ======
var unblock_youku = unblock_youku || {};  // namespace

unblock_youku.default_server = 'www.yōukù.com/proxy.php';  // only for redirection mode
unblock_youku.backup_server = 'yo.uku.im/proxy.php';

unblock_youku.normal_url_list = unblock_youku.url_list.concat([
    'http://live.video.sina.com.cn/room/*',

    'http://pay.youku.com/buy/redirect.html*',
    'http://pay.video.qq.com/fcgi-bin/paylimit*',

    'http://play.baidu.com/*',
    'http://zhangmenshiting.baidu.com/*',
    'http://music.baidu.com/box*',
    'http://music.baidu.com/data/music/songlink*',
    'http://music.baidu.com/data/music/songinfo*',
    'http://music.baidu.com/song/*/download*',
    'http://fm.baidu.com/*',

    'http://v.pptv.com/show/*.html',
    'http://www.songtaste.com/*',
    'http://songtaste.com/*',
    'http://*.gougou.com/*',
    'http://www.yyets.com/*',
    'http://imanhua.com/comic/*',
    'http://www.imanhua.com/comic/*'
]);
unblock_youku.redirect_url_list = unblock_youku.url_list;
unblock_youku.header_extra_url_list = [
    'http://*.xiami.com/*',  // xiami is blocked in HK and TW
    'http://*.ku6.com/*',
    'http://kandian.com/player/getEpgInfo*'  // !!!
];

unblock_youku.ip_addr = new_random_ip();
console.log('ip addr: ' + unblock_youku.ip_addr);
unblock_youku.sogou_auth = new_sogou_auth_str();
console.log('sogou_auth: ' + unblock_youku.sogou_auth);

(function () {
    var xhr = new XMLHttpRequest();
    var url = chrome.extension.getURL('manifest.json');
    xhr.open('GET', url, false);  // blocking
    xhr.send();

    var manifest = JSON.parse(xhr.responseText);
    unblock_youku.version = manifest.version;
    console.log('version: ' + unblock_youku.version);
}());
// the lastest version to show NEW on the icon; it's usually a big update with new features
unblock_youku.lastest_new_version = '2.6.0.0';
get_storage('previous_new_version', function(version) {
    if (typeof version === 'undefined' || version !== unblock_youku.lastest_new_version) {
        chrome.browserAction.setBadgeText({text: 'NEW'});
    }
});


// ====== Configuration Functions ======
function get_mode_name(callback) {
    if (typeof callback === 'undefined') {
        console.error('missing callback function in get_mode_name()');
    }

    get_storage('unblock_youku_mode', function(current_mode) {
        if (typeof current_mode === 'undefined' || (
                current_mode !== 'lite'    &&
                current_mode !== 'normal'  &&
                current_mode !== 'redirect')) {
            set_mode_name('normal', function() {
                callback('normal');
            });
        } else {
            callback(current_mode);
        }
    });
}

function set_mode_name(mode_name, callback) {
    if (typeof callback === 'undefined') {
        console.error('missing callback function in set_mode_name()');
    }

    if (mode_name === 'lite' || mode_name === 'redirect') {
        set_storage('unblock_youku_mode', mode_name, callback);
    } else {
        set_storage('unblock_youku_mode', 'normal', callback);
    }
}

function clear_mode_settings(mode_name) {
    switch (mode_name) {
    case 'lite':
        clear_lite_header();
        console.log('cleared settings for lite');
        break;
    case 'redirect':
        clear_redirect();
        console.log('cleared settings for redirect');
        break;
    case 'normal':
        clear_proxy();
        clear_normal_header();
        clear_timezone();
        console.log('cleared settings for normal');
        break;
    default:
        console.error('should never come here');
        break;
    }

    console.log('cleared the settings for the mode: ' + mode_name);
}

function setup_mode_settings(mode_name) {
    switch (mode_name) {
    case 'lite':
        setup_lite_header();
        break;
    case 'redirect':
        setup_redirect();
        break;
    case 'normal':
        setup_normal_header();
        setup_proxy();
        setup_timezone();
        break;
    default:
        console.error('should never come here');
        break;
    }

    console.log('initialized the settings for the mode: ' + mode_name);
}

function change_mode(new_mode_name) {
    set_mode_name(new_mode_name, function() {});
    // the storage change listener would take care about the setting changes
}

// in case settings are changed (or synced) in background
chrome.storage.onChanged.addListener(function(changes, area) {
    console.log('storage changes:');
    console.log(changes);

    if (typeof changes.unblock_youku_mode !== 'undefined') {
        var mode_change = changes.unblock_youku_mode;

        // doesn't run if it's first time to migrate the old settings
        if (typeof mode_change.oldValue !== 'undefined' && typeof mode_change.newValue !== 'undefined') {
            clear_mode_settings(mode_change.oldValue);
            setup_mode_settings(mode_change.newValue);
            _gaq.push(['_trackEvent', 'Change Mode', mode_change.oldValue + ' -> ' + mode_change.newValue]);
        }
    }

    if (typeof changes.custom_server !== 'undefined') {
        var server_change = changes.custom_server;
        
        if (typeof server_change.newValue !== 'undefined') {
            // have to use a localStorage cache for using in the blocking webRequest listener
            localStorage.custom_server = server_change.newValue;
        } else {
            if (typeof localStorage.custom_server !== 'undefined') {
                localStorage.removeItem('custom_server');
            }
        }
    }

    if (typeof changes.support_us !== 'undefined') {
        var support_change = changes.support_us;

        if (typeof support_change.newValue !== 'undefined' && support_change.newValue === 'yes') {
            change_browser_icon('heart');
        } else {
            change_browser_icon('regular');
        }
    }
});


function change_browser_icon(option) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;

    if (mm === 12 && dd >= 15) {
        chrome.browserAction.setIcon({path: 'chrome/icons/icon19xmas.png'});
        chrome.browserAction.setTitle({title: 'Merry Christmas! (Unblock Youku ' + unblock_youku.version + ')'});
    } else if (option === 'heart') {
        chrome.browserAction.setIcon({path: 'chrome/icons/icon19heart.png'});
        chrome.browserAction.setTitle({title: 'Thank you!  (Unblock Youku ' + unblock_youku.version + ')'});
    } else {
        chrome.browserAction.setIcon({path: 'chrome/icons/icon19.png'});
        chrome.browserAction.setTitle({title: 'Unblock Youku ' + unblock_youku.version});
    }
}


// ====== Initialization ======
document.addEventListener("DOMContentLoaded", function() {
    get_mode_name(function(current_mode_name) {
        setup_mode_settings(current_mode_name);

        _gaq.push(['_trackEvent', 'Init Mode', current_mode_name]);
        _gaq.push(['_trackEvent', 'Version', unblock_youku.version]);

        get_storage('support_us', function(option) {
            if (option === 'yes') {
                change_browser_icon('heart');
                _gaq.push(['_trackEvent', 'Init Support', 'Yes']);
            } else {
                change_browser_icon('regular');
                _gaq.push(['_trackEvent', 'Init Support', 'No']);
            }
        });
    });
});

