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


function new_random_ip() {
    var ip_addr = '220.181.111.';
    //ip_addr += Math.floor(Math.random() * 255) + '.';
    ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
    return ip_addr;
}


function url2pac(url_list, proxy_server) {
    var s = 'function FindProxyForURL(url, host) {   \n' +
            '    if (';
    for (var i = 0; i < url_list.length; i++) {
        s += 'shExpMatch(url, "' + url_list[i] + '")';
        if (i == url_list.length - 1) {
            s += ')\n';
        } else {
            s += ' ||\n\t\t';
        }
    }
    s +=    '    return "PROXY ' + proxy_server + '";\n' +
            'else                                    \n' +
            '    return "DRIECT";                    \n' +
            '}';
    return s;
}


var exports = exports || {};
exports.new_random_ip = new_random_ip;
//exports.url2pac = url2pac;
