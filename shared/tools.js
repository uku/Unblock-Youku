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
