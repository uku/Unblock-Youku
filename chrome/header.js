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
