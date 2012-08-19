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
var numCPUs = require('os').cpus().length;


var test = require('../common/tools');
console.log(test.new_random_ip());


// the base portions of domain names to be removed
var server_domains = [
    'yo.uku.im',
    '127.0.0.1',
    '127.0.0.1.xip.io'
];


// http://stackoverflow.com/questions/646628/javascript-startswith
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
    };
}


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
    for (var i = 0; i < numCPUs; i++) {
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

        request.headers.host = target.host;
        var options = {
            hostname: 'h15.dxt.bj.ie.sogou.com',
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
        });

        request.on('data', function(chunk) {
            proxy_req.write(chunk);
        });
        request.on('end', function() {
            proxy_req.end();
        });
    }).listen(8888, '127.0.0.1');
}
