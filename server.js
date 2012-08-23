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

var sogou = require('./shared/sogou');
var url_list = require('./shared/urls');
var shared_tools = require('./shared/tools');


var server_addr, server_port, to_proxy;
// appfog's documents and online sample codes are horrible
if (process.env.VMC_APP_PORT || process.env.VCAP_APP_PORT || process.env.PORT) {
    server_addr = '0.0.0.0';
    server_port = process.env.VMC_APP_PORT || process.env.VCAP_APP_PORT || process.env.PORT;
    to_proxy = false;
} else {
    server_addr = '127.0.0.1';
    server_port = 8080;
    to_proxy = true;
}


// learnt from http://goo.gl/X8zmc
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
    };
}
// if (typeof String.prototype.endsWith != 'function') {
//     String.prototype.endsWith = function(str) {
//         return this.slice(-str.length) == str;
//     };
// }


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
    for (var i in url_list.regex_url_list) {
        if (url_list.regex_url_list[i].test(target_url)) {
            return true;
        }
    }
    return false;
}


if (cluster.isMaster) {
    for (var i = 0; i < num_CPUs; i++) {
        cluster.fork();
    }

} else {
    http.createServer(function(request, response) {
        // console.info(request.connection.remoteAddress + ': ' + request.method + ' ' + request.url);

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

        var target = get_real_target(request.url);
        if (!target.host) {
            response.writeHead(403);
            response.end();
            return;
        }

        var req_options;
        if (is_valid_url(target.href)) {
            var sogou_auth = sogou.new_sogou_auth_str();
            var timestamp = Math.round(new Date().getTime() / 1000).toString(16);
            var sogou_tag = sogou.compute_sogou_tag(timestamp, target.hostname);

            request.headers['X-Sogou-Auth'] = sogou_auth;
            request.headers['X-Sogou-Timestamp'] = timestamp;
            request.headers['X-Sogou-Tag'] = sogou_tag;

            var random_ip = shared_tools.new_random_ip();
            request.headers['X-Forwarded-For'] = random_ip;

            request.headers.host = target.host;
            var proxy_server = sogou.new_sogou_proxy_addr();
            req_options = {
                hostname: proxy_server,
                path: target.href,
                method: request.method,
                headers: request.headers
            };
        } else if (to_proxy) {
            // serve as a normal proxy
            if (request.headers['proxy-connection']) {
                request.headers['connection'] = request.headers['proxy-connection'];
                delete request.headers['proxy-connection'];
            }
            request.headers.host = target.host;
            req_options = {
                host: target.host,
                hostname: target.hostname,
                port: +target.port,
                path: target.path,
                method: request.method,
                headers: request.headers
            };
        } else {
            // neither proxy nor redirect
            response.writeHead(403);
            response.end();
            return;
        }

        var proxy_req = http.request(req_options, function(res) {
            res.on('data', function(chunk) {
                response.write(chunk);
            });
            res.on('end', function() {
                response.end();
            });
            res.on('error', function(err) {
                console.log('Proxy Error: ' + err.message);
            });

            response.writeHead(res.statusCode, res.headers);
        });

        request.on('data', function(chunk) {
            proxy_req.write(chunk);
        });
        request.on('end', function() {
            proxy_req.end();
        });
        request.on('error', function(err) {
            console.log('Server Error: ' + err.message);
        });
    }).listen(server_port, server_addr);

    console.log('Listening on ' + server_addr + ':' + server_port);
}


process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

