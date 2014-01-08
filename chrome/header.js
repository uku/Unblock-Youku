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

/*global chrome: false, unblock_youku: false, compute_sogou_tag: false */
/*global ga_report_error: false */
"use strict";

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

function setup_lite_header() {
    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(lite_header_modifier)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            lite_header_modifier,
            {urls: unblock_youku.normal_url_list},  // the same url list as normal mode
            ['requestHeaders', 'blocking']
        );
        console.log('lite_header_modifier is set');
    } else {
        var err_msg = 'lite_header_modifier is already there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}

function setup_normal_header() {
    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(normal_header_modifier)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            normal_header_modifier,
            {
                urls: unblock_youku.normal_url_list
            },
            ['requestHeaders', 'blocking']
        );
        console.log('normal_header_modifier is set');
    } else {
        var err_msg = 'normal_header_modifer is already there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}


function clear_lite_header() {
    if (chrome.webRequest.onBeforeSendHeaders.hasListener(lite_header_modifier)) {
        chrome.webRequest.onBeforeSendHeaders.removeListener(lite_header_modifier);
        console.log('lite_header_modifier is removed');
    } else {
        var err_msg = 'lite_header_modifer is not there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}

function clear_normal_header() {
    if (chrome.webRequest.onBeforeSendHeaders.hasListener(normal_header_modifier)) {
        chrome.webRequest.onBeforeSendHeaders.removeListener(normal_header_modifier);
        console.log('normal_header_modifier is removed');
    } else {
        var err_msg = 'normal_header_modifier is not there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}


// extra sites to handle
function extra_header_modifier(details) {
    details.requestHeaders.push({
        name: 'X-Forwarded-For',
        value: unblock_youku.ip_addr
    });

    return {requestHeaders: details.requestHeaders};
}

function setup_extra_header() {
    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(extra_header_modifier)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            extra_header_modifier,
            {
                urls: unblock_youku.header_extra_url_list
            },
            ['requestHeaders', 'blocking']
        );
        console.log('extra_header_modifier is set');
    } else {
        var err_msg = 'extra_header_modifer is already there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}

