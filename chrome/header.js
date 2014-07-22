/*
 * Copyright (C) 2012 - 2014  Bo Zhu  http://zhuzhu.org
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

/*global chrome: false, unblock_youku: false */
/*global ga_report_error: false */
"use strict";


function header_modifier(details) {
    console.log('modify headers of ' + details.url);

    details.requestHeaders.push({
        name: 'X-Forwarded-For',
        value: unblock_youku.ip_addr
    }, {
        name: 'Client-IP',
        value: unblock_youku.ip_addr
    });

    return {requestHeaders: details.requestHeaders};
}


function setup_header() {
    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(header_modifier)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            header_modifier,
            {
                urls: unblock_youku.normal_url_list
            },
            ['requestHeaders', 'blocking']
        );
        console.log('header_modifier is set');
    } else {
        var err_msg = 'header_modifer is already there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}


function clear_header() {
    if (chrome.webRequest.onBeforeSendHeaders.hasListener(header_modifier)) {
        chrome.webRequest.onBeforeSendHeaders.removeListener(header_modifier);
        console.log('header_modifier is removed');
    } else {
        var err_msg = 'header_modifier is not there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}


// extra sites to handle
function extra_header_modifier(details) {
    details.requestHeaders.push({
        name: 'X-Forwarded-For',
        value: unblock_youku.ip_addr
    }, {
        name: 'Client-IP',
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

