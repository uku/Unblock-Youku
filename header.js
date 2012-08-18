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
        console.log('something is wrong -- header_modifier is still invoked');
        return {};
    }

    if (current_mode === 'normal') {
        var timestamp = Math.round(details.timeStamp / 1000).toString(16);
        var target_host = details.url.match(/:\/\/(.[^\/]+)/)[1];
        var tag = compute_sogou_tag(timestamp + target_host + 'SogouExplorerProxy');

        console.log(timestamp + ' ' + target_host + ' ' + tag);

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
        urls: [
            'http://*.xiami.com/*',  // xiami is blocked in HK and TW
            'http://*.ku6.com/*',    // couldn't find ku6's sub-domain for checking ip, but this should already work
            'http://ting.sina.com.cn/*'
        ]
    },

    ['requestHeaders', 'blocking']);
// addListener ends here


// based on http://xiaoxia.org/2011/03/10/depressed-research-about-sogou-proxy-server-authentication-protocol/
function compute_sogou_tag(s) {
    var total_len = s.length;
    var numb_iter = Math.floor(total_len / 4);
    var numb_left = total_len % 4;

    var hash = total_len;  // output hash tag

    for (var i = 0; i < numb_iter; i++) {
        low  = s.charCodeAt(4 * i + 1) * 256 + s.charCodeAt(4 * i);  // right most 16 bits in little-endian
        high = s.charCodeAt(4 * i + 3) * 256 + s.charCodeAt(4 * i + 2);  // left most

        hash += low;
        hash %= 0x100000000;
        hash ^= hash << 16;

        hash ^= high << 11;
        hash += hash >>> 11;
        hash %= 0x100000000;
    }

    switch (numb_left) {
    case 3:
        hash += (s.charCodeAt(total_len - 2) << 8) + s.charCodeAt(total_len - 3);
        hash %= 0x100000000;
        hash ^= hash << 16;
        hash ^= s.charCodeAt(total_len - 1) << 18;
        hash += hash >>> 11;
        hash %= 0x100000000;
        break;
    case 2:
        hash += (s.charCodeAt(total_len - 1) << 8) + s.charCodeAt(total_len - 2);
        hash %= 0x100000000;
        hash ^= hash << 11;
        hash += hash >>> 17;
        hash %= 0x100000000;
        break;
    case 1:
        hash += s.charCodeAt(total_len - 1);
        hash %= 0x100000000;
        hash ^= hash << 10;
        hash += hash >>> 1;
        hash %= 0x100000000;
        break;
    default:
        break;
    }

    hash ^= hash << 3;
    hash += hash >>> 5;
    hash %= 0x100000000;

    hash ^= hash << 4;
    hash += hash >>> 17;
    hash %= 0x100000000;

    hash ^= hash << 25;
    hash += hash >>> 6;
    hash %= 0x100000000;

    // learnt from http://stackoverflow.com/questions/6798111/bitwise-operations-on-32-bit-unsigned-ints
    hash = hash >>> 0;

    return ('00000000' + hash.toString(16)).slice(-8);
}
