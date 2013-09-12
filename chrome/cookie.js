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

/*global chrome: false, _gaq: false, unblock_youku */
"use strict";

function cookie_forwarder(details) {
    // 1. clean up all existing cookies in the headers
    // 2. chrome.cookies.getAll to retrieve cookies for the redirected domain
    // 3. reassemble the cookies and set in the http headers
    return {};
}

function cookie_retriever(details) {
    // 1. set cookies for the redirected domain if set-cookie is in the headers
    // 2. remove set-cookie from the http headers
    return {};
}

function setup_cookie() {
    if (!chrome.webRequest.onBeforeRequest.hasListener(cookie_forwarder)) {
        chrome.webRequest.onBeforeRequest.addListener(
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

