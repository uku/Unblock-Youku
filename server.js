#!/usr/bin/env node

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


var http = require('http');
var cluster = require('cluster');

var sogou = require('./shared/sogou');
var shared_tools = require('./shared/tools');
var server_utils = require('./server/utils');


var local_addr, local_port, proxy_addr, run_locally;
if (process.env.VMC_APP_PORT || process.env.VCAP_APP_PORT || process.env.PORT) {
    local_addr = '0.0.0.0';
    local_port = process.env.VMC_APP_PORT || process.env.VCAP_APP_PORT || process.env.PORT;
    proxy_addr = 'proxy.uku.im:80';
    run_locally = false;
} else {
    // local_addr = '127.0.0.1';
    local_addr = '0.0.0.0';
    local_port = 8888;
    proxy_addr = server_utils.get_first_external_ip() + ':' + local_port;
    run_locally = true;
}
var pac_file_content = shared_tools.url2pac(require('./shared/urls').url_list, proxy_addr);


// learnt from http://goo.gl/X8zmc
if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) === str;
    };
}


if (cluster.isMaster) {
    var num_CPUs = require('os').cpus().length;

    var i;
    for (i = 0; i < num_CPUs; i++) {
        cluster.fork();
    }

    console.log('Please use this PAC file: http://' + proxy_addr + '/proxy.pac');

} else {
    var sogou_server_addr = sogou.new_sogou_proxy_addr();
    console.log('default sogou server: ' + sogou_server_addr);
    server_utils.change_sogou_server(function(new_addr) {
        sogou_server_addr = new_addr;
        console.log('changed to new sogou server: ' + new_addr);
    });
    require('timers').setInterval(function() {
        server_utils.change_sogou_server(function(new_addr) {
            sogou_server_addr = new_addr;
            console.log('changed to new sogou server: ' + new_addr);
        });
    }, 10 * 60 * 1000);  // every 10 mins

    var my_date = new Date();
    
    http.createServer(function(request, response) {
        console.info(request.connection.remoteAddress + ': ' + request.method + ' ' + request.url);

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

        if (request.url === '/proxy.pac') {
            response.writeHead(200, {
                'Content-Type': 'application/x-ns-proxy-autoconfig'
            });
            response.end(pac_file_content);
            return;
        }

        var target;
        if (request.url.startsWith('/proxy') || request.url.startsWith('http')) {
            target = server_utils.get_real_target(request.url);
        } else if (typeof request.headers.host !== 'undefined'){
            target = server_utils.get_real_target('http://' + request.headers.host + request.url);
        } else {
            response.writeHead(500);
            response.end();
            return;
        }
        if (!target.host) {
            response.writeHead(403);
            response.end();
            return;
        }

        var req_options;
        //if (server_utils.is_valid_url(target.href)) {
        if (true) {
            var sogou_auth = sogou.new_sogou_auth_str();
            var timestamp = Math.round(my_date.getTime() / 1000).toString(16);
            var sogou_tag = sogou.compute_sogou_tag(timestamp, target.hostname);

            request.headers['X-Sogou-Auth'] = sogou_auth;
            request.headers['X-Sogou-Timestamp'] = timestamp;
            request.headers['X-Sogou-Tag'] = sogou_tag;

            var random_ip = shared_tools.new_random_ip();
            request.headers['X-Forwarded-For'] = random_ip;

            request.headers.host = target.host;
            req_options = {
                hostname: sogou_server_addr,
                path: target.href,
                method: request.method,
                headers: request.headers
            };
        } else if (run_locally) {
            // serve as a normal proxy
            if (typeof request.headers['proxy-connection'] !== 'undefined') {
                // request.headers.connection = request.headers['proxy-connection'];
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
                console.error('Proxy Error: ' + err.message);
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
            console.error('Server Error: ' + err.message);
        });
    }).listen(local_port, local_addr);

    console.log('Listening on ' + local_addr + ':' + local_port);
}


process.on('uncaughtException', function(err) {
    console.error('Caught exception: ' + err);
});

