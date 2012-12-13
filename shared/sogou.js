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


if (typeof string_starts_with !== 'function') {
    // should only reach here in node.js runtime
    var string_starts_with = require('./tools').string_starts_with;
}


function new_sogou_auth_str() {
    var auth_str = '/30/853edc6d49ba4e27';
    var i, tmp_str;
    for (i = 0; i < 8; i++) {
        tmp_str = ('0000' + Math.floor(Math.random() * 65536).toString(16)).slice(-4);
        auth_str = tmp_str.toUpperCase() + auth_str;
    }
    return auth_str;
}


function new_sogou_proxy_addr() {
    var random_num = Math.floor(Math.random() * (16 + 16));  // 0 ~ 15 edu and 0 ~ 15 dxt
    var proxy_addr;
    if (random_num < 16) {
        proxy_addr = 'h' + random_num + '.dxt.bj.ie.sogou.com';  // 0 ~ 15
    } else {
        proxy_addr = 'h' + (random_num - 16) + '.edu.bj.ie.sogou.com';  // (16 ~ 31) - 16
    }
    return proxy_addr;
}


// based on http://goo.gl/th215
function compute_sogou_tag(timestamp, target_link) {
    var hostname;
    if (string_starts_with(target_link, 'http://')) {
        hostname = target_link.match(/^http:\/\/(.[^:\/]+)/)[1];
    } else {
        hostname = target_link;
    }
    var s = timestamp + hostname + 'SogouExplorerProxy';
    var total_len = s.length;
    var numb_iter = Math.floor(total_len / 4);
    var numb_left = total_len % 4;

    var hash = total_len;  // output hash tag

    var i;
    for (i = 0; i < numb_iter; i++) {
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

    // learnt from http://goo.gl/oRJ0o
    hash = hash >>> 0;

    return ('00000000' + hash.toString(16)).slice(-8);
}


// export as a node.js module
var exports = exports || {};
exports.new_sogou_auth_str = new_sogou_auth_str;
exports.compute_sogou_tag = compute_sogou_tag;
exports.new_sogou_proxy_addr = new_sogou_proxy_addr;
