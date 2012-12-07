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


var url = require('url');
var http = require('http');
var querystring = require('querystring');

var regex_url_list = require('../shared/urls').regex_url_list;
var new_sogou_proxy_addr = require('../shared/sogou').new_sogou_proxy_addr;


function get_first_external_ip() {
    try {
        // only return the first external ip, which should be fine for usual cases
        var interfaces = require('os').networkInterfaces();
        var i, j;
        for (i in interfaces) {
            if (interfaces.hasOwnProperty(i)) {
                for (j = 0; j < interfaces[i].length; j++) {
                    var addr = interfaces[i][j];
                    if (addr.family === 'IPv4' && !addr.internal) {
                        return addr.address;
                    }
                }
            }
        }
    } catch (err) {
        return '127.0.0.1';
    }

    return '127.0.0.1';  // no external ip, so bind internal ip
}


// learnt from http://goo.gl/X8zmc
if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) === str;
    };
}


function get_real_target(req_path) {
    var real_target = {};

    // the 'path' in proxy requests should always start with http
    if (req_path.startsWith('http')) {
        real_target = url.parse(req_path);
    } else {
        var real_url = querystring.parse(url.parse(req_path).query).url;
        if (real_url) {
            var buf = new Buffer(real_url, 'base64');
            real_url = buf.toString();
            real_target = url.parse(real_url);
        }
    }
    if (!real_target.port) {
        real_target.port = 80;
    }
    return real_target;
}


function is_valid_url(target_url) {
    var i;
    for (i = 0; i < regex_url_list.length; i++) {
        if (regex_url_list[i].test(target_url)) {
            return true;
        }
    }
    return false;
}


function change_sogou_server(callback, depth) {
    var new_addr = new_sogou_proxy_addr();

    if (typeof depth === 'undefined') {
        depth = 0;
    } else if (depth > 5) {
        callback(new_addr);
    }

    http.get('http://' + new_addr, function(res) {
        callback(new_addr);
    }).on('error', function(err) {
        change_sogou_server(callback, depth + 1);
    });
}


exports.get_first_external_ip = get_first_external_ip;
exports.get_real_target = get_real_target;
exports.is_valid_url = is_valid_url;
exports.change_sogou_server = change_sogou_server;
