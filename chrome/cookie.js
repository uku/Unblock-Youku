/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012, 2013 Bo Zhu http://zhuzhu.org
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

/*global chrome: false, _gaq: false, unblock_youku: false, atob: false */
"use strict";

function cookie_forwarder(details) {
    // 0. check url and decoded url
    var splitted_url = details.url.split('?url=');
    if (splitted_url.length < 2) {
        console.error('cannot find ?url= in the redirected url');
        return {};
    }
    var original_url;
    try {
        original_url = atob(splitted_url[1]);
    } catch(err) {
        console.error('problems with b64decoding: ' + err);
        return {};
    }

    // 1. clean up all existing cookies in the headers
    var req_headers = details.requestHeaders;
    var new_headers = [];
    var i;
    for (i = 0; i < req_headers.length; i++) {
        if (req_headers[i].name.toLowerCase() !== 'cookie') {
            new_headers.push(req_headers[i]);
        }
    }

    // 2. chrome.cookies.getAll to retrieve cookies for the redirected domain
    chrome.cookies.getAll({url: original_url}, function(cookies) {
    });

    // how to make blocking calls to retrieve cookies?
    // 3. reassemble the cookies and set in the http headers

    return {};
}

function cookie_retriever(details) {
    // 1. set cookies for the redirected domain if set-cookie is in the headers
    // 2. remove set-cookie from the http headers
    return {};
}

function setup_cookie() {
    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(cookie_forwarder)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            cookie_forwarder,
            {urls: [
                'http://' + unblock_youku.default_get_server,
                'http://' + unblock_youku.default_post_server,
                'http://' + unblock_youku.backup_get_server,
                'http://' + unblock_youku.backup_post_server
            ]},
            ["blocking"]
        );
        console.log('cookie_forwarder is set');
    } else {
        var err_msg = 'cookie_forwarder is already there!';
        console.error(err_msg);
        _gaq.push(['_trackEvent', 'Unexpected Error', err_msg]);
    }

    // set up cookie_retriever
}


function clear_timezone() {
    if (chrome.webRequest.onBeforeRequest.hasListener(cookie_forwarder)) {
        chrome.webRequest.onBeforeRequest.removeListener(cookie_forwarder);
        console.log('cookie_forwarder is removed');
    } else {
        var err_msg = 'cookie_forwarder is not there!';
        console.error(err_msg);
        _gaq.push(['_trackEvent', 'Unexpected Error', err_msg]);
    }

    // clear cookie_retriever
}

