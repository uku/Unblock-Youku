#!/usr/bin/env node

/*
 * Copyright (C) 2012 - 2016  Bo Zhu  http://zhuzhu.org
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


var net = require('net');
var url = require('url');
var util = require('util');
var domain = require('domain');
var cluster = require('cluster');
var http = require('http');
http.globalAgent.maxSockets = Infinity;

// mikeal/request might have a bug
// always obtain TLS errors when proxying over https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var colors = require('colors');
var request = require('request');
var validator = require('validator');

var shared_tools = require('../shared/tools');
var server_utils = require('./utils');


function check_url_format(str) {
    if (!validator.isURL(str, {
        protocols: ['http', 'https'],
        require_tld: true,
        require_protocol: true
    })) {
        return 'Input Error: Invalid URL format'.red;
    }
//    return;  // return nothing
}

var opts = require("nomnom")
    // .help('Run a redirect server for the Chrome extension')
    .option('nolog', {
        flag: true,
        help: 'Do not print request logs'
    })
    .option('proxy', {
        type: 'string',
        metavar: 'HTTP://IP_ADDRESS:PORT',
        help: 'Send requests through a remote proxy',
        callback: check_url_format
    })
    .option('bak_proxy', {
        type: 'string',
        help: 'Set another proxy server for backup',
        metavar: 'HTTP://IP_ADDRESS:PORT',
        callback: check_url_format
    })
    .option('pac_proxy', {
        type: 'string',
        help: 'Use a different proxy in the PAC file',
        metavar: 'HTTP://IP_ADDRESS:PORT',
        callback: check_url_format
    })
    .parse();
// console.log(opts);

var local_port = process.env.PORT || 8888;
if ((!opts.proxy) && process.env.PROXY_ADDR) {
    opts.proxy = process.env.PROXY_ADDR;
}
if ((!opts.bak_proxy) && process.env.BAK_PROXY_ADDR) {
    opts.bak_proxy = process.env.BAK_PROXY_ADDR;
}
if (!opts.pac_proxy) {
    if (process.env.PAC_PROXY_ADDR) {
        opts.pac_proxy = process.env.PAC_PROXY_ADDR;
    } else if (opts.proxy) {
        opts.pac_proxy = opts.proxy;
    }
}

//opts.proxy = 'http://abc.com:8888';

if ((opts.proxy && (check_url_format(opts.proxy) !== undefined))
        || (opts.bak_proxy && (check_url_format(opts.bak_proxy) !== undefined))
        || (opts.pac_proxy && (check_url_format(opts.pac_proxy) !== undefined))) {
    console.error('ENV Error: Invalid URL format'.red);
    process.exit(400);
}
//console.log(opts);

var pac_file_content = null;
var pac_proxy_obj = null;
if (opts.pac_proxy) {
    pac_proxy_obj = url.parse(opts.pac_proxy);
    if (!pac_proxy_obj.host || !pac_proxy_obj.protocol) {
        console.error('Invalid URL format parsed'.red);
        process.exit(401);
    }
    pac_file_content = server_utils.generate_pac_file(pac_proxy_obj.host, pac_proxy_obj.protocol);
} else {
    pac_file_content = 'function FindProxyForURL(url, host) {return "DIRECT";}';
}
//console.log(pac_file_content);


function http_req_handler(client_request, client_response) {
    if (!opts.nolog) {
        console.log(
                '[ub.uku.js] '
                + client_request.connection.remoteAddress + ': '
                + client_request.method + ' ' + client_request.url.underline);
    }

    if ((client_request.url === '/proxy.pac' || client_request.url === '/pac.pac')
            || (!shared_tools.string_starts_with(client_request.url, '/proxy'))) {
        server_utils.static_responses(client_request, client_response, pac_file_content);
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
    if (!server_utils.is_valid_url(target.href)) {
        client_response.writeHead(403, {
            'Cache-Control': 'public, max-age=14400'
        });
        client_response.end();
        return;
    }


    var proxy_request_headers = server_utils.filter_request_headers(client_request.headers);
    proxy_request_headers.Host = target.host;
    var proxy_request_options = {
        encoding: null, // disable auto `buffer.toString()` in package "request"
        url: target.href,
//        url: 'http://httpbin.org/status/400',
        method: client_request.method,
        headers: proxy_request_headers
    };
    if (opts.proxy) {
        proxy_request_options.proxy = opts.proxy;
    }

    function handle_proxy_request_error() {
        try {
            client_response.writeHead(500);
            client_response.end('Error occurred, sorry.');
        } catch (er) {
            console.error('[ub.uku.js] Error sending 500', er, client_request.url);
        }
    }

    function handle_proxy_response_data(response, payload) {
        var filtered_headers = server_utils.filter_response_headers(response.headers);
        client_response.writeHead(response.statusCode, filtered_headers);
        client_response.end(payload);
    }

    request(proxy_request_options, function(err, resp, body) {
        if (err) {
            console.error('[ub.uku.js] first proxy_request error: (' + err.code + ') ' + err.message, client_request.url);
            if (opts.bak_proxy) {  // retry the request
                setTimeout(function() {    // run it in 1s
                    proxy_request_options.proxy = opts.bak_proxy;
                    request(proxy_request_options, function(err, resp, body) {
                        if (err) {
                            console.error('[ub.uku.js] second proxy_request error: (' + err.code + ') ' + err.message, client_request.url, err.stack);
                            handle_proxy_request_error();

                        } else {
                            handle_proxy_response_data(resp, body);
                        }
                    });
                }, 1000);

            } else {
                handle_proxy_request_error();
            }

        } else {
            handle_proxy_response_data(resp, body);
        }
    });
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
        util.log('[ub.uku.js] Worker ' + worker.process.pid
            + ' is now connected to ' + addr_port.address + ':' + addr_port.port);
    });

    cluster.on('exit', function(worker, code, signal) {
        if (signal) {
            util.log('[ub.uku.js] Worker ' + worker.process.pid
                + ' was killed by signal: ' + signal);
        } else if (code !== 0) {
            console.error('[ub.uku.js] Worker ' + worker.process.pid
                + ' exited with error code: ' + code);
            // respawn a worker process when one dies
            cluster.fork();
        } else {
            console.error('[ub.uku.js] Worker ' + worker.process.pid + ' exited.');
        }
    });

    console.log('The redirect server is running...'.green);
    if (opts.proxy) {
        console.log(('Using the remote proxy: ' + opts.proxy).green);
    } else {
        console.log('Running locally without remote proxies.'.green);
    }
    if (opts.bak_proxy) {
        console.log(('Using the backup proxy: ' + opts.bak_proxy).green);
    }
    if (opts.pac_proxy) {
        console.log(('The PAC file uses the proxy: ' + opts.pac_proxy).green);
    }

} else if (cluster.isWorker) {
    var ubuku_server = http.createServer();
    ubuku_server.on('request', http_req_handler);

    ubuku_server.listen(local_port, '0.0.0.0').on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            console.error('[ub.uku.js] Port number is already in use! Exiting now...');
            process.exit();
        }
    });
}


process.on('uncaughtException', function(err) {
    console.error('[ub.uku.js] Caught uncaughtException: ' + err, err.stack);
    process.exit(213);
});
