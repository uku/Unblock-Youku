/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
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


function new_random_ip() {
    "use strict";
    var ip_addr = '220.181.111.';
    //ip_addr += Math.floor(Math.random() * 255) + '.';
    ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
    return ip_addr;
}


// Generate proxy.pac file
function parse_url(url_str) {
    var colon_idx, path_idx, urlobj;
    colon_idx = url_str.indexOf("://");
    if (colon_idx < 0) {
        return null;
    }
    colon_idx += 3;
    path_idx = url_str.indexOf("/", colon_idx);
    if (path_idx < 0) {
        url_str += "/";
        path_idx = url_str.length;
    }
    urlobj = {
        host: url_str.slice(colon_idx, path_idx),
        path: url_str.slice(path_idx)
    };
    return urlobj;
}

function gen_url_map(ulist) {
    var url_map, uobj, k, u, val_list, i, txt;
    url_map = {};
    for (i = 0; i < ulist.length; i++) {
        u = ulist[i];
        uobj = parse_url(u);
        if (uobj === null || uobj.host.indexOf("*") >= 0) {
            k = "any";
        } else {
            k = uobj.host;
            u = uobj.path.slice(1);
        }
        val_list = url_map[k] || [];
        if (val_list.length === 0) {
            url_map[k] = val_list;
        }
        val_list.push(u);
    }
    if (!url_map["any"]) {
        url_map["any"] = [];
    }
    txt = JSON.stringify(url_map, null, "    ");
    return txt;
}

function urls2pac(url_whitelist, url_list, proxy_server) {
    var white_str, block_str, txt;
    white_str = gen_url_map(url_whitelist);
    block_str = gen_url_map(url_list);
    txt = ("function FindProxyForURL(url, host) {\n" +
           "  var i, patterns, prefix, shell_match=shExpMatch;\n" +
           "  var white_list = " + white_str + ";\n" +
           "  var url_list = " + block_str + ";\n" +
           "  prefix = white_list[host] ? '*/' : '';\n" +
           "  patterns = white_list[host] || white_list['any']\n" +
           "  for (i = 0; i < patterns.length; i++)\n" +
           "    if (shell_match(url, prefix + patterns[i]))\n" +
           "        return 'DIRECT';\n" +
           "  prefix = url_list[host] ? '*/' : '';\n" +
           "  patterns = url_list[host] || url_list['any']\n" +
           "  for (i = 0; i < patterns.length; i++)\n" +
           "    if (shell_match(url, prefix + patterns[i]))\n" +
           "        return 'PROXY " + proxy_server + "';\n" +
           "  return 'DIRECT';\n" +
           "}");
    return txt;
}

function string_starts_with(str, substr) {
    "use strict";
    return str.slice(0, substr.length) === substr;
}


// change host to Host, or user-agent to User-Agent
function to_title_case(str) {
    "use strict";
    // just a little differnt from http://goo.gl/IGhfR
    return str.replace(/\w[^\-\s]*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}


var exports = exports || {};
exports.new_random_ip = new_random_ip;
exports.urls2pac = urls2pac;
exports.string_starts_with = string_starts_with;
exports.to_title_case = to_title_case;
