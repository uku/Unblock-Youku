/*
 * Copyright (C) 2012 - 2016  Bo Zhu  http://zhuzhu.org
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

/*global string_starts_with: false */
"use strict";


function http_redirector(details) {
    console.log('original url: ' + details.url);
    if (details.url.slice(-15) === 'crossdomain.xml') {
        console.log('directly pass');
        return {};
    }
    var redirect_url = null;

    // special treatment for play.baidu
    if (details.url.slice(0, 41) === 'http://play.baidu.com/data/music/songlink') {
        redirect_url = 'http://play.baidu.com/data/cloud/songlink' + details.url.slice(41);
        console.log('redirect url: ' + redirect_url);
        return {redirectUrl: redirect_url};
    }

    var backend_server;
    if (typeof localStorage.custom_redirect_server === 'undefined') {
        backend_server = unblock_youku.actual_redirect_server;
    } else {
        backend_server = localStorage.custom_redirect_server;
    }

    if (string_starts_with(details.url, 'http://')) {
        redirect_url = 'http://' + backend_server + '/http/' + details.url.substring('http://'.length);
    } else if (string_starts_with(details.url, 'https://')) {
        redirect_url = 'http://' + backend_server + '/https/' + details.url.substring('https://'.length);
    }
    console.log('redirect url: ' + redirect_url);

    if (redirect_url !== null) {
        return {redirectUrl: redirect_url};
    }
    return {};
}


function clear_redirect() {
    if (chrome.webRequest.onBeforeRequest.hasListener(http_redirector)) {
        chrome.webRequest.onBeforeRequest.removeListener(http_redirector);
        console.log('http_redirector is removed');
    } else {
        console.log('http_redirector is not there!');
    }
}
