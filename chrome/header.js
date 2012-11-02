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


function setup_lite_header() {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        lite_header_modifier,
        {
            urls: unblock_youku.normal_url_list  // the same url list as normal mode
        },
        ['requestHeaders', 'blocking']);
    // addListener ends here
    console.log('lite_header_modifier is set');
}

function setup_normal_header() {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        normal_header_modifier,
        {
            urls: unblock_youku.normal_url_list
        },
        ['requestHeaders', 'blocking']);
    // addListener ends here
    console.log('normal_header_modifier is set');
}


function clear_lite_header() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(lite_header_modifier);
    console.log('lite_header_modifier is removed');
}

function clear_normal_header() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(normal_header_modifier);
    console.log('normal_header_modifier is removed');
}


function lite_header_modifier(details) {
    details.requestHeaders.push({
        name: 'X-Forwarded-For',
        value: unblock_youku.ip_addr
    });

    return {requestHeaders: details.requestHeaders};
}

function normal_header_modifier(details) {
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
    }, {
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
