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


function new_random_ip() {
    var ip_addr = '220.181.111.';
    //ip_addr += Math.floor(Math.random() * 255) + '.';
    ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
    return ip_addr;
}


function url2pac(url_list, proxy_server) {
    var s = 'function FindProxyForURL(url, host) {\n' +
            '    if (';

    var i;
    for (i = 0; i < url_list.length; i++) {
        s += 'shExpMatch(url, "' + url_list[i] + '")';
        if (i === url_list.length - 1) {
            s += ') {\n';
        } else {
            s += ' ||\n            ';
        }
    }

    s += '        return "PROXY ' + proxy_server + '";\n' +
         '    }\n';

    s += '    return "DIRECT";\n' +
         '}';

    return s;
}


function string_starts_with(str, substr) {
    return str.slice(0, substr.length) === substr;
}


// change host to Host, or user-agent to User-Agent
function to_title_case(str) {
    // just a little differnt from http://goo.gl/IGhfR
    return str.replace(/\w[^\-\s]*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}


var exports = exports || {};
exports.new_random_ip = new_random_ip;
exports.url2pac = url2pac;
exports.string_starts_with = string_starts_with;
exports.to_title_case = to_title_case;
