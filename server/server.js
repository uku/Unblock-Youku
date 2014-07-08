#!/usr/bin/env node

/*
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


var net = require('net');
var url = require('url');
var util = require('util');
var http = require('http');
var cluster = require('cluster');
http.globalAgent.maxSockets = Infinity;


var argv = require('optimist')
    .string('proxy')   // remote proxy address, such as http://123.45.67.89:8888
    .boolean('nolog')  // do not show network logs
    .argv
;
var colors = require('colors');
var request = require('request');


var shared_tools = require('../shared/tools');
var server_utils = require('./utils');


var raven = null;
var raven_client = null;
if (process.env.SENTRY_ADDRESS) {
    raven = require('raven');
    raven_client = new raven.Client(process.env.SENTRY_ADDRESS);
    raven_client.patchGlobal();
    raven_client.captureMessage('Sentry is running...');
} 


local_port = process.env.PORT || 8888;
var pac_file_content = null;
if (argv.proxy) {
    // TODO parse proxy argv
    pac_file_content = server_utils.generate_pac_file(proxy_addr + ':' + proxy_port);
}
// console.log(pac_file_content);


function http_req_handler(client_request, client_response) {
    if (!argv.nolog) {
        console.log(
                '[ub.uku.js] '
                + client_request.connection.remoteAddress + ': '
                + client_request.method + ' ' + client_request.url.underline);
    }

    if (client_request.url === '/proxy.pac' ||
            (!shared_tools.string_starts_with(client_request.url, '/proxy') &&
             !shared_tools.string_starts_with(client_request.url, 'http'))) {
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
    var proxy_request_options;
    if (!server_utils.is_valid_url(target.href)) {
        client_response.writeHead(403, {
            'Cache-Control': 'public, max-age=14400'
        });
        client_response.end();
        return;
    }
    var proxy_request_headers = server_utils.filtered_request_headers(client_request.headers);
    proxy_request_headers.Host = target.host;

    var proxy_request_options = {
        url: target.href,
        method: client_request.method,
        headers: proxy_request_headers
    };
    if (argv.proxy) {
        proxy_request_options.proxy = argv.proxy;
    }
    var proxy_request = request(proxy_request_options);
    client_request.pipe(proxy_request);
    proxy_request.pipe(client_response);

    /*
    client_request.on('error', function(err) {
        util.error('[ub.uku.js] client_request error: (' + err.code + ') ' + err.message, err.stack);
        proxy_request.end();  // is this correct?
    });
    client_response.on('error', function(err) {
        util.error('[ub.uku.js] client_response error: (' + err.code + ') ' + err.message, err.stack);
        proxy_request.end();
    });
    */
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

    console.log('The redirect server is running...'.green);
    if (argv.proxy) {
        console.log(('Using the remote proxy: ' + argv.proxy).green);
    } else {
        console.log('Running locally without remote proxies.'.green);
    }

} else if (cluster.isWorker) {
    var ubuku_server = http.createServer();
    ubuku_server.on('request', http_req_handler);

    ubuku_server.listen(local_port, '0.0.0.0').on('error', function(err) {
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

