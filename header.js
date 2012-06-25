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
    if (current_mode() !== 'normal' && current_mode() !== 'lite') {
        console.log('something is wrong -- header_modifier is still invoked');
        return {};
    }

    if (current_mode() === 'normal') {
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
            'http://*.ku6.com/*'     // couldn't find ku6's sub-domain for checking ip, but this should already work
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
