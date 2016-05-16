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

'use strict';

var url = require('url');
var util = require('util');
var http = require('http');
var querystring = require('querystring');
var uglify = require('uglify-js');

var shared_urls = require('../shared/urls');
var shared_tools = require('../shared/tools');

var string_starts_with = shared_tools.string_starts_with;
var to_title_case = shared_tools.to_title_case;


function get_real_target(req_path) {
    var real_target = {};
    var real_url = null;

    if (string_starts_with(req_path, '/proxy/http/')) {
        real_url = 'http://' + req_path.substring('/proxy/http/'.length);
    } else if (string_starts_with(req_path, '/proxy/https/')) {
        real_url = 'https://' + req_path.substring('/proxy/https/'.length);
    } else {
        real_url = querystring.parse(url.parse(req_path).query).url;
        if (real_url) {
            // to use urlsafe_b64encode
            real_url = real_url.replace('-', '+').replace('_', '/');

            // fix possible padding errors
            // real_url += (new Array((4 - real_url.length % 4) % 4 + 1)).join('=');
            var i;
            for (i = 0; i < (4 - real_url.length % 4) % 4; i++) {
                real_url += '=';
            }

            var buf = new Buffer(real_url, 'base64');
            real_url = buf.toString();
        }
    }

    if (real_url) {
        real_target = url.parse(real_url);
        if (!real_target.port) {
            real_target.port = 80;
        }
    }

    return real_target;
}


function is_valid_url(target_url) {
    var i;
    for (i = 0; i < shared_urls.regex_crx_bypass_urls.length; i++) {
        if (shared_urls.regex_crx_bypass_urls[i].test(target_url)) {
            return false;
        }
    }
    for (i = 0; i < shared_urls.regex_crx_urls.length; i++) {
        if (shared_urls.regex_crx_urls[i].test(target_url)) {
            return true;
        }
    }

    return false;
}


function filter_request_headers(headers) {
    var ret_headers = {};

    var field;
    for (field in headers) {
        if (headers.hasOwnProperty(field)) {
            if (string_starts_with(field, 'proxy-')) {
                if (field === 'proxy-connection') {
                    ret_headers.Connection = headers['proxy-connection'];
                }
            } else if (field === 'user-agent') {
                if (headers['user-agent'].indexOf('CloudFront') !== -1 ||
                        headers['user-agent'].indexOf('CloudFlare') !== -1) {
                    ret_headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) ' +
                        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36';
                } else {
                    ret_headers['User-Agent'] = headers['user-agent'];
                }
            } else if (field !== 'cookie' &&
                       field !== 'via' &&
                       (!string_starts_with(field, 'x-'))) {
                // in case some servers do not recognize lower-case headers, such as hacker news
                ret_headers[to_title_case(field)] = headers[field];
            }
        }
    }

    return ret_headers;
}


function filter_response_headers(headers) {
    var res_headers = {};

    var field;
    for (field in headers) {
        if (headers.hasOwnProperty(field)) {
            if (string_starts_with(field, 'proxy-')) {
                if (field === 'proxy-connection') {
                    res_headers.Connection = headers['proxy-connection'];
                }
            } else if (field !== 'set-cookie' &&
                       field !== 'cache-control' &&
                       field !== 'expires' &&
                       field !== 'pragma' &&
                       field !== 'age' &&
                       field !== 'via' &&
                       field !== 'server' &&
                       (!string_starts_with(field, 'x-'))) {
                res_headers[field] = headers[field];
            }
        }
    }
    res_headers['cache-control'] = 'public, max-age=3600';
    res_headers.server = '; DROP TABLE servertypes; --';

    return res_headers;
}


function static_responses(client_request, client_response, pac_file_content) {
    if (client_request.url === '/crossdomain.xml') {
        client_response.writeHead(200, {
            'Content-Type': 'text/xml',
            'Content-Length': '113',
            'Cache-Control': 'public, max-age=2592000'
        });
        client_response.end('<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<cross-domain-policy><allow-access-from domain="*"/></cross-domain-policy>');
        return;
    }

    if (client_request.url === '/status') {
        var status_text = 'OK';

        client_response.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Length': status_text.length.toString(),
            'Cache-Control': 'public, max-age=3600'
        });
        client_response.end(status_text);
        return;
    }

    if (client_request.url === '/proxy.pac' || client_request.url === '/pac.pac') {
        var content_type = 'application/x-ns-proxy-autoconfig';
        if (client_request.headers['user-agent'] !== undefined &&
                client_request.headers['user-agent'].indexOf('PhantomJS') !== -1) {
            content_type = 'text/plain';
        }
        client_response.writeHead(200, {
            'Content-Type': content_type,
            'Content-Length': pac_file_content.length.toString(),
            'Cache-Control': 'public, max-age=14400'
        });
        client_response.end(pac_file_content);
        return;
    }

    if (client_request.url === '/favicon.ico') {
        client_response.writeHead(404, {
            'Cache-Control': 'public, max-age=2592000'
        });
        client_response.end();
        return;
    }

    if (client_request.url === '/robots.txt') {
        client_response.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Length': '25',
            'Cache-Control': 'public, max-age=2592000'
        });
        client_response.end('User-agent: *\nDisallow: /');
        return;
    }

    if (client_request.url === '/regex') {
        var regex_list = shared_urls.produce_squid_regex_list(true /* for PAC proxy */);
        var regex_text = regex_list.join('\n');

        client_response.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Length': regex_text.length.toString(),
            'Cache-Control': 'public, max-age=3600'
        });
        client_response.end(regex_text);
        return;
    }

    if (client_request.url === '/chrome_regex') {
        var chrome_regex_list = shared_urls.produce_squid_regex_list(false /* for Chrome proxy */);
        var chrome_regex_text = chrome_regex_list.join('\n');

        client_response.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Length': chrome_regex_text.length.toString(),
            'Cache-Control': 'public, max-age=60'
        });
        client_response.end(chrome_regex_text);
        return;
    }

    client_response.writeHead(403, {
        'Cache-Control': 'public, max-age=14400'
    });
    client_response.end();
}


function generate_pac_file(proxy_addr_port, proxy_protocol) {
    return '/*\n' +
        '  Installing/using this software, you agree that this software is\n' +
        '  only for study purposes and its authors and service providers  \n' +
        '  take no responsibilities for any consequences.\n' +
        '*/\n' +
        uglify.minify(
            shared_tools.urls2pac(
                shared_urls.pac_bypass_urls,
                shared_urls.pac_urls,
                proxy_addr_port,
                proxy_protocol
            ),
            {fromString: true}
        ).code;
}


exports.get_real_target = get_real_target;
exports.is_valid_url = is_valid_url;
exports.filter_request_headers = filter_request_headers;
exports.filter_response_headers = filter_response_headers;
exports.static_responses = static_responses;
exports.generate_pac_file = generate_pac_file;
