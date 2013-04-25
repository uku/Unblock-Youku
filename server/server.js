#!/usr/bin/env node

/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012, 2013 Bo Zhu http://zhuzhu.org
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


var util = require('util');
var http = require('http');
http.globalAgent.maxSockets = Infinity;
var cluster = require('cluster');

var colors = require('colors');
var argv = require('optimist')
    .default('port', 8888)
    .boolean('local_only')
    .default('local_only', false)
    .boolean('production')
    .default('production', false)
    .argv
;

// What's the reason to cause occasional H17 error for /status?
// H17 error - "Poorly formatted HTTP response"
// Might it be a bug in nodejs or optimist?
var in_production = false;
if (argv.production) {
    in_production = true;
}

var raven = null;
var raven_client = null;
if (process.env.SENTRY_ADDRESS) {
    raven = require('raven');
    raven_client = new raven.Client(process.env.SENTRY_ADDRESS);
    raven_client.patchGlobal();
    raven_client.captureMessage('Sentry is running...');
} 

var sogou = require('../shared/sogou');
var shared_tools = require('../shared/tools');
var server_utils = require('./utils');


var local_addr, local_port, proxy_addr;
if (!in_production) {
    local_port = argv.port;
    if (argv.local_only) {
        local_addr = '127.0.0.1';
        proxy_addr = '127.0.0.1:' + local_port;
    } else {
        local_addr = '0.0.0.0';
        proxy_addr = server_utils.get_first_external_ip() + ':' + local_port;
    }
} else {
    local_port = process.env.PORT || 8888;
    local_addr = '0.0.0.0';
    proxy_addr = 'proxy.uku.im:80';
}
var pac_file_content = shared_tools.url2pac(require('../shared/urls').url_list, proxy_addr);


// what are the life cycles of variables in nodejs?
var sogou_server_addr;
var reset_count = 0, MAX_RESET_COUNT = 1;
var timeout_count = 0, MAX_TIMEOUT_COUNT = 4;
var in_changing_server = false, last_error_code = null;
function change_sogou_server(error_code) {
    if (true === in_changing_server) {
        return;  // should already be in the process of changing new server
    }
    in_changing_server = true;

    if ('string' === typeof error_code) {
        last_error_code = error_code;
    } else {
        last_error_code = null;
    }
    server_utils.renew_sogou_server(function(new_addr) {
        sogou_server_addr = new_addr;
        if (null !== last_error_code) {
            util.error('[ub.uku.js] on ' + last_error_code + ' error, changed server to ' + new_addr);
        }
        reset_count = 0;
        timeout_count = 0;
        in_changing_server = false;
    });
}
    
if (cluster.isMaster) {
    var num_CPUs = require('os').cpus().length;
    // num_CPUs = 1;

    var i;
    for (i = 0; i < num_CPUs; i++) {
        cluster.fork();
        // one note here
        // the fork() in nodejs is not as the fork() in C
        // here the fork() will run the whole code from beginning
        // not from where it is invoked
    }

    cluster.on('listening', function(worker, addr_port) {
        // use ub.uku.js as keyword for searching in log files
        util.log('[ub.uku.js] Worker ' + worker.process.pid + ' is now connected to ' + addr_port.address + ':' + addr_port.port);
    });

    cluster.on('exit', function(worker, code, signal) {
        if (signal) {
            util.log('[ub.uku.js] Worker ' + worker.process.pid + ' was killed by signal: ' + signal);
        } else if (code !== 0) {
            util.error('[ub.uku.js] Worker ' + worker.process.pid + ' exited with error code: ' + code);
            // respawn a worker process when one dies
            cluster.fork();
        } else {
            // util.error('[ub.uku.js] Worker ' + worker.process.pid + ' exited with no error; this should never happen');
            util.error('[ub.uku.js] Worker ' + worker.process.pid + ' exited.');
        }
    });

    if (in_production) {
        console.log('Starting in production mode...'.yellow);
    } else {
        var srv = 'http://' + proxy_addr + '/proxy.pac\n';
        var msg = 'The local proxy server is running...\nPlease use this PAC file: ' + srv.underline;
        console.log(msg.green);
    }

} else if (cluster.isWorker) {
    sogou_server_addr = sogou.new_sogou_proxy_addr();
    // console.log('default server: ' + sogou_server_addr);
    change_sogou_server();
    var change_server_timer = setInterval(change_sogou_server, 10 * 60 * 1000);  // every 10 mins
    if ('function' === typeof change_server_timer.unref) {
        change_server_timer.unref();  // doesn't exist in nodejs v0.8
    }

    http.createServer(function(client_request, client_response) {
        client_request.on('error', function(err) {
            util.error('[ub.uku.js] client_request error: (' + err.code + ') ' + err.message, err.stack);
        });
        client_response.on('error', function(err) {  // does this work?
            util.error('[ub.uku.js] client_response error: (' + err.code + ') ' + err.message, err.stack);
        });

        if (!in_production) {
            console.log('[ub.uku.js] ' + client_request.connection.remoteAddress + ': ' + client_request.method + ' ' + client_request.url.underline);
        }

        if (!shared_tools.string_starts_with(client_request.url, '/proxy') &&
                !shared_tools.string_starts_with(client_request.url, 'http')) {
            if (client_request.url === '/status') {
                client_response.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Cache-Control': 'public, max-age=3600',
                    // 'Cache-Control': 'private, max-age=0, must-revalidate',
                    'Server': '; DROP TABLE servertypes; --'
                });
                if (in_production) {
                    client_response.write('Production ');
                }
                client_response.end('OK');
                return;
            }

            if (client_request.url === '/crossdomain.xml') {
                client_response.writeHead(200, {
                    'Content-Type': 'text/xml',
                    'Cache-Control': 'public, max-age=2592000',
                    'Server': '; DROP TABLE servertypes; --'
                });
                client_response.end('<?xml version="1.0" encoding="UTF-8"?>\n' +
                        '<cross-domain-policy><allow-access-from domain="*"/></cross-domain-policy>');
                return;
            }

            if (client_request.url === '/favicon.ico') {
                client_response.writeHead(404, {
                    'Cache-Control': 'public, max-age=2592000',
                    'Server': '; DROP TABLE servertypes; --'  // as reddit hahaha
                });
                client_response.end();
                return;
            }

            if (client_request.url === '/robots.txt') {
                client_response.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Cache-Control': 'public, max-age=2592000',
                    'Server': '; DROP TABLE servertypes; --'
                });
                client_response.end('User-agent: *\nDisallow: /');
                return;
            }

            client_response.writeHead(403, {
                'Cache-Control': 'public, max-age=14400',
                'Server': '; DROP TABLE servertypes; --'
            });
            client_response.end();
            return;
        }

        if (client_request.url === '/proxy.pac') {
            client_response.writeHead(200, {
                'Content-Type': 'application/x-ns-proxy-autoconfig',
                'Cache-Control': 'public, max-age=14400',
                'Server': '; DROP TABLE servertypes; --'
            });
            client_response.end(pac_file_content);
            return;
        }

        // cannot forward cookie settings for other domains in redirect mode
        var forward_cookies = false;
        if (shared_tools.string_starts_with(client_request.url, 'http')) {
            forward_cookies = true;
        }

        var target = server_utils.get_real_target(client_request.url);
        if (!target.host) {
            client_response.writeHead(403, {
                'Cache-Control': 'public, max-age=14400',
                'Server': '; DROP TABLE servertypes; --'
            });
            client_response.end();
            return;
        }

        var proxy_request_options;
        // if (true) {
        if (server_utils.is_valid_url(target.href)) {
            var sogou_auth = sogou.new_sogou_auth_str();
            var timestamp = Math.round(Date.now() / 1000).toString(16);
            var sogou_tag = sogou.compute_sogou_tag(timestamp, target.hostname);

            var proxy_request_headers = server_utils.filtered_request_headers(
                client_request.headers,
                forward_cookies
            );
            proxy_request_headers['X-Sogou-Auth'] = sogou_auth;
            proxy_request_headers['X-Sogou-Timestamp'] = timestamp;
            proxy_request_headers['X-Sogou-Tag'] = sogou_tag;
            proxy_request_headers['X-Forwarded-For'] = shared_tools.new_random_ip();
            proxy_request_headers.Host = target.host;

            proxy_request_options = {
                hostname: sogou_server_addr,
                host: sogou_server_addr,
                port: +target.port,  // but always 80
                path: target.href,
                method: client_request.method,
                headers: proxy_request_headers
            };
        } else if (!in_production) {
            // serve as a normal proxy server
            client_request.headers.host = target.host;
            proxy_request_options = {
                host: target.host,
                hostname: target.hostname,
                port: +target.port,
                path: target.path,
                method: client_request.method,
                headers: server_utils.filtered_request_headers(client_request.headers, forward_cookies)
            };
        } else {
            client_response.writeHead(403, {
                'Cache-Control': 'public, max-age=14400',
                'Server': '; DROP TABLE servertypes; --'
            });
            client_response.end();
            return;
        }


        // console.log('Client Request:');
        // console.log(proxy_request_options);
        // console.log(client_request.headers);
        // console.log(server_utils.filtered_request_headers(client_request.headers, forward_cookies));
        var proxy_request = http.request(proxy_request_options, function(proxy_response) {
            proxy_response.on('error', function(err) {
                util.error('[ub.uku.js] proxy_response error: (' + err.code + ') ' + err.message, err.stack);
            });
            proxy_response.pipe(client_response);

            // console.log('Server Response:');
            // console.log(proxy_response.statusCode);
            // console.log(proxy_response.headers);
            // console.log(server_utils.filtered_response_headers(proxy_response.headers, forward_cookies));
            client_response.writeHead(
                proxy_response.statusCode,
                server_utils.filtered_response_headers(proxy_response.headers, forward_cookies)
            );
        });
        proxy_request.on('error', function(err) {
            util.error('[ub.uku.js] proxy_request error: (' + err.code + ') ' + err.message, err.stack);
            if ('ECONNRESET' === err.code) {
                reset_count += 1;
                util.log('[ub.uku.js] ' + sogou_server_addr + ' reset_count: ' + reset_count);
                if (reset_count >= MAX_RESET_COUNT) {
                    change_sogou_server('ECONNRESET');
                }
            } else if ('ETIMEDOUT' === err.code) {
                timeout_count += 1;
                util.log('[ub.uku.js] ' + sogou_server_addr + ' timeout_count: ' + timeout_count);
                if (timeout_count >= MAX_TIMEOUT_COUNT) {
                    change_sogou_server('ETIMEOUT');
                }
            }
            // should we explicitly end client_response when error occurs?
            client_response.statusCode = 599;
            client_response.end();
            // should we also destroy the proxy_request object?
        });

        client_request.pipe(proxy_request);
    }).listen(local_port, local_addr).on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            util.error('[ub.uku.js] Port number is already in use! Exiting now...');
            process.exit();
        }
    });
}

process.on('uncaughtException', function(err) {
    util.error('[ub.uku.js] Caught exception: ' + err, err.stack);
    if (raven_client !== null) {
        raven_client.captureError(err);
    } 
    process.exit(213);
});

