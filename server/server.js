/*
 * A redirection server for the Chrome extension
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


var http = require('http');
var url = require('url');
var querystring = require('querystring');
var cluster = require('cluster');
var num_CPUs = require('os').cpus().length;

var sogou = require('../shared/sogou');
var url_list = require('../shared/urls');
var shared_tools = require('../shared/tools');


// allowed server domain names
var server_domains = [
    'yo.uku.im',
    '127.0.0.1',
    '127.0.0.1.xip.io'
];


// learnt from http://goo.gl/X8zmc
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}
// if (typeof String.prototype.endsWith != 'function') {
//     String.prototype.endsWith = function (str){
//         return this.slice(-str.length) == str;
//     };
// }


function get_real_target(req_host, req_uri) {
    var real_target = {};
    req_host = req_host.split(':', 1)[0];

    if (req_uri.startsWith('http')) {
        real_target = url.parse(req_uri);
    } else {
        for (var i = 0; i < server_domains.length; i++) {
            if (req_host == base_domains[i]) {
                var real_url = querystring.parse(url.parse(req_uri).query).url;
                var buf = new Buffer(real_url, 'base64');
                real_url = buf.toString();
                real_target = url.parse(real_url);
                break;
            }
        }
    }
    if (!real_target.port) {
        real_target.port = 80;
    }
    return real_target;
}


if (cluster.isMaster) {
    for (var i = 0; i < num_CPUs; i++) {
        cluster.fork();
    }
} else {
    http.createServer(function(request, response) {
        //console.info(request.connection.remoteAddress + ': ' + request.method + ' ' + request.url);

        if (request.url === '/favicon.ico') {
            response.writeHead(404);
            response.end();
            return;
        }

        if (request.url === '/crossdomain.xml') {
            response.writeHead(200, {
                'Content-Type': 'text/xml'
            });
            response.end('<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<cross-domain-policy><allow-access-from domain="*"/></cross-domain-policy>');
            return;
        }

        var target = get_real_target(request.headers.host, request.url);
        if (!target.host) {
            response.writeHead(403);
            response.end();
            return;
        }

        // check url

        var sogou_auth = sogou.new_sogou_auth_str();
        var timestamp = Math.round(new Date().getTime() / 1000).toString(16);
        var sogou_tag = sogou.compute_sogou_tag(timestamp, request.url);

        request.headers['X-Sogou-Auth'] = sogou_auth;
        request.headers['X-Sogou-Timestamp'] = timestamp;
        request.headers['X-Sogou-Tag'] = sogou_tag;

        var random_ip = shared_tools.new_random_ip();
        request.headers['X-Forwarded-For'] = random_ip;

        request.headers.host = target.host;
        var proxy_server = sogou.new_sogou_proxy_addr();
        var options = {
            hostname: proxy_server,
            path: target.href,
            method: request.method,
            headers: request.headers
        };
        var proxy_req = http.request(options, function(res) {
            response.writeHead(res.statusCode, res.headers);

            res.on('data', function(chunk) {
                response.write(chunk);
            });
            res.on('end', function() {
                response.end();
            });
            // need to handle error
        });

        request.on('data', function(chunk) {
            proxy_req.write(chunk);
        });
        request.on('end', function() {
            proxy_req.end();
        });
        // need to handle error
    }).listen(8888, '127.0.0.1');
}
