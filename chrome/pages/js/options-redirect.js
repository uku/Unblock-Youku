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

/*global $: false, btoa: false */

var background = background || chrome.extension.getBackgroundPage();
var default_redirect_server = background.unblock_youku.default_redirect_server;

function remove_custom_redirect_server(callback) {
    "use strict";
    // localStorage.removeItem('custom_redirect_server');
    background.remove_storage('custom_redirect_server', callback);
}

function get_custom_redirect_server(callback) {
    "use strict";
    background.get_storage('custom_redirect_server', function(server_addr) {
        if (typeof server_addr === 'undefined') {
            callback(default_redirect_server);
        } else {
            callback(server_addr);
        }
    });
}

function set_custom_redirect_server(server_addr, callback) {
    "use strict";
    if (server_addr === default_redirect_server) {
        // must remove, otherwise the post server won't be invoked
        remove_custom_redirect_server(callback);
    } else {
        // chrome.storage.sync.onChange listener will change localStorage as well
        // localStorage.custom_redirect_server = server_addr;
        background.set_storage('custom_redirect_server', server_addr, callback);
    }
}


function show_redirect_message(type, content) {
    "use strict";
    var alert_type = 'info';
    if (type === 'success' || type === 'warning') {
        alert_type = type;  // success, info, or warning
    }

    $('#redirect_message').html('<div class="alert alert-' + alert_type + '"><button type="button" class="close" data-dismiss="alert">×</button>' + content + '</div>');
}


function show_redirect_error(content) {
    $('#redirect_message').html('<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>' + content + '</div>');
}


$('document').ready(function() {
    "use strict";
    get_custom_redirect_server(function(server_addr) {
        $('input#custom_redirect_server').val(server_addr);
    });


    $('button#custom_redirect_test').click(function() {
        var test_url = 'http://' + $('input#custom_redirect_server').val() + '?url=' + btoa('http://ipservice.163.com/isFromMainland');
        show_redirect_message('info', 'Waiting...');
        $.get(test_url, function(data) {
            if (data === 'true') {
                show_redirect_message('success', 'Test passed. Please remember to save the new configuration.');
            } else {
                show_redirect_error('Test failed! Perhaps your server isn\'t located in mainland China.');
            }
        }).error(function() {
            show_redirect_error('Test failed! Perhaps the server isn\'t working properly.');
        });
    });

    $('button#custom_redirect_save').click(function() {
        set_custom_redirect_server($('input#custom_redirect_server').val(), function() {
            show_redirect_message('info', 'The new backend server is set.');
        });
    });


    $('button#custom_redirect_reset').click(function() {
        remove_custom_redirect_server(function() {
            $('input#custom_redirect_server').val(default_redirect_server);
            show_redirect_message('warning', 'Reset to the default backend server.');
        });
    });

    $('#form_custom_redirect_server').submit(function(event) {
        // prevent the default action of submitting a form
        event.preventDefault();
    });
});

