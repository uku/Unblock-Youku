/*
 * Let you smoothly surf on many websites blocking non-mainland visitors.
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


function setup_header() {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        header_modifier,
        {
            urls: unblock_youku.normal_url_list
        },
        ['requestHeaders', 'blocking']);
    // addListener ends here
    console.log('header_modifier is set');
}

function clear_header() {
    // does this work? It's undocumented in Chrome dev docs
    chrome.webRequest.onBeforeSendHeaders.removeListener(header_modifier);
    console.log('header_modifier is removed');
}


function header_modifier(details) {
    var current_mode = get_current_mode();

    if (current_mode !== 'normal' && current_mode !== 'lite') {
        console.error('something is wrong -- header_modifier is still invoked');
        return {};
    }

    if (current_mode === 'normal') {
        var timestamp = Math.round(details.timeStamp / 1000).toString(16);
        var tag = compute_sogou_tag(timestamp, details.url);

        console.log('t=' + timestamp + ' h=' + tag + ' ' + details.url);

        details.requestHeaders.push({
            name: 'X-Sogou-Auth',
            value: unblock_youku.sogou_auth
        }, {
            name: 'X-Sogou-Timestamp',
            value: timestamp
        }, {
            name: 'X-Sogou-Tag',
            value: tag
        });
    }
    
    details.requestHeaders.push({
        name: 'X-Forwarded-For',
        value: unblock_youku.ip_addr
    });

    return {requestHeaders: details.requestHeaders};
}


// extra sites to handle
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        details.requestHeaders.push({
            name: 'X-Forwarded-For',
            value: unblock_youku.ip_addr
        });

        return {requestHeaders: details.requestHeaders};
    },

    {
        urls: unblock_youku.header_extra_url_list
    },

    ['requestHeaders', 'blocking']);
// addListener ends here
