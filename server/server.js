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


var new_relic_working = false;
if (process.env.NEW_RELIC_LICENSE_KEY) {
    require('newrelic');
    new_relic_working = true;
}


var argv = require('optimist')
    .default('ip', '0.0.0.0')  // listen to all interfaces
    .default('port', '8888')
    .boolean('local_only')  // force --ip=127.0.0.1
    .boolean('mitm_proxy')  // for debug use; no access control
    .boolean('nolog')       // do not show network logs
    .boolean('production')  // pre-set configs for production server
    .argv
;
var colors = require('colors');


// check input parameters
var validator = require('validator');
function validate_input(str, fun, msg) {
    if (!fun(str.toString())) {
        console.error(msg.red);
        process.exit(1);
    }
}

validate_input(argv.ip, validator.isIP, 'Invalid input for IP address.');
validate_input(argv.port, validator.isNumeric, 'Invalid input for port number.');
if (argv.ext_ip) {  // custom IP/domain address in the PAC file, in case the proxy server is behind a router or firewall
    if (argv.ext_ip !== validator.escape(argv.ext_ip)) {
        console.error('Invalid input for external IP/domain address.'.red);
        process.exit(1);
    }
}
if (argv.ext_port) {  // custom port number
    validate_input(argv.ext_port, validator.isNumeric, 'Invalid input for external port number.');
}


var net = require('net');
var url = require('url');
var util = require('util');
var http = require('http');
var cluster = require('cluster');
http.globalAgent.maxSockets = Infinity;

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


var local_addr, local_port, proxy_addr, proxy_port, status_text;
if (!argv.production) {
    if (argv.local_only) {
        local_addr = '127.0.0.1';
        proxy_addr = '127.0.0.1';
    } else {
        local_addr = argv.ip;
        if (argv.ext_ip) {
            proxy_addr = argv.ext_ip;
        } else if (local_addr === '0.0.0.0') {
            proxy_addr = server_utils.get_first_external_ip();
        } else {
            proxy_addr = local_addr;
        }
    }

    local_port = argv.port;
    if (argv.ext_port) {
        proxy_port = argv.ext_port;
    } else {
        proxy_port = local_port;
    }
} else {
    local_addr = '0.0.0.0';
    local_port = process.env.PORT || 8888;
    proxy_addr = 'proxy.uku.im';
    proxy_port = '80';

    argv.local_only = false;
    argv.mitm_proxy = false;
    argv.nolog = true;
}
var pac_file_content = server_utils.generate_pac_file(proxy_addr + ':' + proxy_port);
// console.log(pac_file_content);


var sogou_server_addr;
var reset_count = 0, MAX_RESET_COUNT = 1;
var refuse_count = 0, MAX_REFUSE_COUNT = 2;
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
        refuse_count = 0;
        timeout_count = 0;
        in_changing_server = false;
    });
}
function count_sogou_server_errors(err) {
    if ('ECONNRESET' === err.code) {
        reset_count++;
        util.log('[ub.uku.js] ' + sogou_server_addr + ' reset_count: ' + reset_count);
        if (reset_count >= MAX_RESET_COUNT) {
            change_sogou_server('ECONNRESET');
        }
    } else if ('ECONNREFUSED' === err.code) {
        refuse_count++;
        util.log('[ub.uku.js] ' + sogou_server_addr + ' refuse_count: ' + refuse_count);
        if (refuse_count >= MAX_REFUSE_COUNT) {
            change_sogou_server('ECONNREFUSED');
        }
    } else if ('ETIMEDOUT' === err.code) {
        timeout_count++;
        util.log('[ub.uku.js] ' + sogou_server_addr + ' timeout_count: ' + timeout_count);
        if (timeout_count >= MAX_TIMEOUT_COUNT) {
            change_sogou_server('ETIMEOUT');
        }
    }
}


function http_req_handler(client_request, client_response) {
    if (!argv.nolog) {
        console.log('[ub.uku.js] ' + client_request.connection.remoteAddress + ': ' + client_request.method + ' ' + client_request.url.underline);
    }

    if (client_request.url === '/proxy.pac' ||
            (!shared_tools.string_starts_with(client_request.url, '/proxy') &&
             !shared_tools.string_starts_with(client_request.url, 'http'))) {
        server_utils.static_responses(client_request, client_response, argv.production, pac_file_content);
    }

    // cannot forward cookie settings for other domains in redirect mode
    var forward_cookies = false;
    if (shared_tools.string_starts_with(client_request.url, 'http')) {
        forward_cookies = true;
    }

    var target = server_utils.get_real_target(client_request.url);
    if (!target.host) {
        client_response.writeHead(403, {
            'Cache-Control': 'public, max-age=14400'
        });
        client_response.end();
        return;
    }

    // access control
    var proxy_request_options;
    var to_use_proxy = server_utils.is_valid_url(target.href);
    if (to_use_proxy) {
        var proxy_request_headers = server_utils.filtered_request_headers(
            client_request.headers,
            forward_cookies
        );
        server_utils.add_sogou_headers(proxy_request_headers, target.hostname);
        proxy_request_headers.Host = target.host;

        proxy_request_options = {
            hostname: sogou_server_addr,
            host: sogou_server_addr,
            port: 80,
            path: target.href,
            method: client_request.method,
            headers: proxy_request_headers
        };
    } else if (argv.mitm_proxy) {
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
            'Cache-Control': 'public, max-age=14400'
        });
        client_response.end();
        return;
    }

    // connect to the target server
    var proxy_request = http.request(proxy_request_options, function(proxy_response) {
        proxy_response.on('error', function(err) {
            util.error('[ub.uku.js] proxy_response error: (' + err.code + ') ' + err.message, err.stack);
            client_response.statusCode = 599;
            client_response.end();
            proxy_request.end();
        });

        proxy_response.pipe(client_response);

        client_response.writeHead(
            proxy_response.statusCode,
            server_utils.filtered_response_headers(proxy_response.headers, forward_cookies)
        );
    });
    proxy_request.on('error', function(err) {
        util.error('[ub.uku.js] proxy_request error: (' + err.code + ') ' + err.message, err.stack);

        if (to_use_proxy) {
            // do not need to count the errors if the url is not proxied
            count_sogou_server_errors(err);
        }

        // should we explicitly end client_response when error occurs?
        client_response.statusCode = 599;
        client_response.end();
        proxy_request.end();
        // should we also destroy the proxy_request object?
    });
    client_request.on('error', function(err) {
        util.error('[ub.uku.js] client_request error: (' + err.code + ') ' + err.message, err.stack);
        proxy_request.end();  // is this correct?
    });
    client_response.on('error', function(err) {  // does this work?
        util.error('[ub.uku.js] client_response error: (' + err.code + ') ' + err.message, err.stack);
        proxy_request.end();
    });

    client_request.pipe(proxy_request);
}


function connect_req_handler(client_request, client_socket, client_head) {
    // this should only be used for proxy server, not redirect server

    client_request.on('error', function(err) {
        util.error('[ub.uku.js] CONNECT client_request error: (' + err.code + ') ' + err.message, err.stack);
    });

    if (!argv.nolog) {
        console.log('[ub.uku.js] ' + client_request.connection.remoteAddress + ': CONNECT ' + client_request.url.underline);
    }

    // if (true) {  
    if (server_utils.is_valid_https_domain(url.parse('https://' + client_request.url).hostname)) {
        var proxy_request_headers = client_request.headers;
        server_utils.add_sogou_headers(proxy_request_headers, client_request.headers.host);

        var proxy_request_options = {
            hostname: sogou_server_addr,
            host: client_request.url,
            port: 80,
            path: client_request.url,
            method: 'CONNECT',
            headers: proxy_request_headers
        };
        var proxy_request = http.request(proxy_request_options);
        proxy_request.on('connect', function(proxy_response, proxy_socket) {
            proxy_response.on('error', function(err) {
                // do we need to listen to the error of proxy_response?
                util.error('[ub.uku.js] CONNECT proxy_response error: (' + err.code + ') ' + err.message, err.stack);
            });
            proxy_socket.on('error', function(err) {
                util.error('[ub.uku.js] CONNECT proxy_socket error: (' + err.code + ') ' + err.message, err.stack);
                count_sogou_server_errors(err);
                client_socket.end();  // what's the difference with emit('end')?
            });
            client_socket.on('error', function(err) {
                util.error('[ub.uku.js] CONNECT client_socket error: (' + err.code + ') ' + err.message, err.stack);
                proxy_socket.end();
            });

            client_socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            proxy_socket.write(client_head);
            proxy_socket.pipe(client_socket);
            client_socket.pipe(proxy_socket);
        });
        proxy_request.on('error', function(err) {
            util.error('[ub.uku.js] CONNECT proxy_request error: (' + err.code + ') ' + err.message, err.stack);
            count_sogou_server_errors(err);
            client_socket.end();
        });

        proxy_request.end();

    } else if (argv.mitm_proxy) {
        // serve as a normal proxy server
        var target = url.parse('https://' + client_request.url);
        var proxy_socket = net.connect(443, target.hostname, function() {
            client_socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            proxy_socket.write(client_head);
            proxy_socket.pipe(client_socket);
            client_socket.pipe(proxy_socket);
        });
        proxy_socket.on('error', function(err) {
            util.error('[ub.uku.js] CONNECT proxy_socket error: (' + err.code + ') ' + err.message, err.stack);
            client_socket.end();
        });
        client_socket.on('error', function(err) {
            util.error('[ub.uku.js] CONNECT client_socket error: (' + err.code + ') ' + err.message, err.stack);
            proxy_socket.end();
        });

    } else {
        client_socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
    }
}

    
if (cluster.isMaster) {
    var num_CPUs = require('os').cpus().length;
    // num_CPUs = 1;

    var i;
    for (i = 0; i < num_CPUs; i++) {
        cluster.fork();
        // one note here
        // the fork() in nodejs is not the same as the fork() in C
        // fork() in nodejs will run the whole code from beginning
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
            util.error('[ub.uku.js] Worker ' + worker.process.pid + ' exited.');
        }
    });

    if (argv.production) {
        console.log('Starting in production mode...'.yellow);
    } else {
        var srv = 'http://' + proxy_addr + ':' + proxy_port + '/proxy.pac\n';
        var msg = 'The local proxy server is running...\nPlease use this PAC file: ' + srv.underline;
        console.log(msg.green);
    }

    if (new_relic_working) {
        console.log('\nNew Relic is working...\n'.cyan);
    }

} else if (cluster.isWorker) {
    sogou_server_addr = sogou.new_sogou_proxy_addr();
    // console.log('default server: ' + sogou_server_addr);
    change_sogou_server();
    var change_server_timer = setInterval(change_sogou_server, 10 * 60 * 1000);  // every 10 mins
    if ('function' === typeof change_server_timer.unref) {
        change_server_timer.unref();  // doesn't exist in nodejs v0.8
    }

    var ubuku_server = http.createServer();
    ubuku_server.on('request', http_req_handler);
    ubuku_server.on('connect', connect_req_handler);

    ubuku_server.listen(local_port, local_addr).on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            util.error('[ub.uku.js] Port number is already in use! Exiting now...');
            process.exit();
        }
    });
}


process.on('uncaughtException', function(err) {
    util.error('[ub.uku.js] Caught uncaughtException: ' + err, err.stack);
    if (raven_client !== null) {
        raven_client.captureError(err);
    } 
    process.exit(213);
});

