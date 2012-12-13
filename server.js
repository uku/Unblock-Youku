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


if (cluster.isMaster) {
    var num_CPUs = require('os').cpus().length;
    // num_CPUs = 1;

    var i;
    for (i = 0; i < num_CPUs; i++) {
        cluster.fork();
    }

    console.info('Please use this PAC file: http://' + proxy_addr + '/proxy.pac');

} else {
    var sogou_server_addr = sogou.new_sogou_proxy_addr();
    // console.log('default server: ' + sogou_server_addr);
    server_utils.change_sogou_server(function(new_addr) {
        sogou_server_addr = new_addr;
        // console.log('changed to new server: ' + new_addr);
    });
    require('timers').setInterval(function() {
        server_utils.change_sogou_server(function(new_addr) {
            sogou_server_addr = new_addr;
            // console.log('changed to new server: ' + new_addr);
        });
    }, 10 * 60 * 1000);  // every 10 mins
    // }, 20 * 1000);  // every 20 secs


    var my_date = new Date();
    
    http.createServer(function(client_request, client_response) {
        console.info(client_request.connection.remoteAddress + ': ' + client_request.method + ' ' + client_request.url);

        if (client_request.url === '/favicon.ico') {
            client_response.writeHead(404);
            client_response.end();
            return;
        }

        if (client_request.url === '/crossdomain.xml') {
            client_response.writeHead(200, {
                'Content-Type': 'text/xml'
            });
            client_response.end('<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<cross-domain-policy><allow-access-from domain="*"/></cross-domain-policy>');
            return;
        }

        if (client_request.url === '/proxy.pac') {
            client_response.writeHead(200, {
                'Content-Type': 'application/x-ns-proxy-autoconfig'
            });
            client_response.end(pac_file_content);
            return;
        }

        var target;
        if (shared_tools.string_starts_with(client_request.url, '/proxy') || 
                shared_tools.string_starts_with(client_request.url, 'http')) {
            target = server_utils.get_real_target(client_request.url);
        } else if (typeof client_request.headers.host !== 'undefined'){
            target = server_utils.get_real_target('http://' + client_request.headers.host + client_request.url);
        } else {
            client_response.writeHead(500);
            client_response.end();
            return;
        }
        if (!target.host) {
            client_response.writeHead(403);
            client_response.end();
            return;
        }

        var proxy_request_options;
        // if (true) {
        if (server_utils.is_valid_url(target.href)) {
            var sogou_auth = sogou.new_sogou_auth_str();
            var timestamp = Math.round(my_date.getTime() / 1000).toString(16);
            var sogou_tag = sogou.compute_sogou_tag(timestamp, target.hostname);

            client_request.headers['X-Sogou-Auth'] = sogou_auth;
            client_request.headers['X-Sogou-Timestamp'] = timestamp;
            client_request.headers['X-Sogou-Tag'] = sogou_tag;

            client_request.headers['X-Forwarded-For'] = shared_tools.new_random_ip();

            client_request.headers.host = target.host;
            proxy_request_options = {
                hostname: sogou_server_addr,
                host: sogou_server_addr,
                port: +target.port,  // but always 80
                path: target.href,
                method: client_request.method,
                headers: server_utils.filter_headers(client_request.headers)
            };
        } else if (run_locally) {
            // serve as a normal proxy
            client_request.headers.host = target.host;
            proxy_request_options = {
                host: target.host,
                hostname: target.hostname,
                port: +target.port,
                path: target.path,
                method: client_request.method,
                headers: server_utils.filter_headers(client_request.headers)
            };
        } else {
            client_response.writeHead(403);
            client_response.end();
            return;
        }

        // console.log('Client Request:');
        // console.log(proxy_request_options);
        var proxy_request = http.request(proxy_request_options, function(proxy_response) {
            // may change these to stream.pipe later when the stream api is stabilized

            proxy_response.on('data', function(chunk) {
                client_response.write(chunk);
            });
            proxy_response.on('end', function() {
                client_response.end();
            });
            // Do we need to handle this?
            // I didn't find the api like response.close()
            // proxy_response.on('close', function() {
            //     client_response.close();
            // });
            proxy_response.on('error', function(err) {
                console.error('Proxy Error: ' + err.message);
            });

            // console.log('Server Response:');
            // console.log(proxy_response.statusCode);
            // console.log(proxy_response.headers);
            client_response.writeHead(proxy_response.statusCode, proxy_response.headers);
        });

        client_request.on('data', function(chunk) {
            proxy_request.write(chunk);
        });
        client_request.on('end', function() {
            proxy_request.end();
        });
        // It seems there is no request.close() api
        // client_request.on('close', function() {
        //    proxy_request.close();
        // });
        client_request.on('error', function(err) {
            console.error('Server Error: ' + err.message);
        });
    }).listen(local_port, local_addr);

    console.info('Listening on ' + local_addr + ':' + local_port);
}


process.on('uncaughtException', function(err) {
    console.error('Caught exception: ' + err);
});

