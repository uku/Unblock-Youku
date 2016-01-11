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

/*global chrome: false, $: false, localStorage: false */

var background = background || chrome.extension.getBackgroundPage();
var default_proxy_server_proc = background.unblock_youku.default_proxy_server_proc;
var default_proxy_server_addr = background.unblock_youku.default_proxy_server_addr;

function show_proxy_message(type, content) {
    "use strict";
    var alert_type = 'info';
    if (type === 'success' || type === 'warning') {
        alert_type = type;  // success, info, or warning
    }

    $('#proxy_message').html('<div class="alert alert-' + alert_type + '"><button type="button" class="close" data-dismiss="alert">×</button>' + content + '</div>');
}

function show_proxy_error(content) {
    "use strict";
    $('#proxy_message').html('<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>' + content + '</div>');
}

function show_proxy_test_message(type, content) {
    "use strict";
    var alert_type = 'info';
    if (type === 'success' || type === 'warning' || type === 'danger') {
        alert_type = type;  // success, info, or warning
    }

    $('#proxy_test_message').html('<div class="alert alert-' + alert_type + '"><button type="button" class="close" data-dismiss="alert">×</button>' + content + '</div>');
}

function remove_custom_proxy_server(callback) {
    "use strict";
    // Change localStorage first to make sure it contains the correct values before updating PAC
    background.localStorage.removeItem('custom_proxy_server_proc');
    background.localStorage.removeItem('custom_proxy_server_addr');
    background.remove_storage('custom_proxy_server', callback);
}

function set_custom_proxy_server(server_proc, server_addr, callback) {
    "use strict";
    background.localStorage.custom_proxy_server_proc = server_proc;
    background.localStorage.custom_proxy_server_addr = server_addr;
    background.set_storage("custom_proxy_server", {
        proc : server_proc,
        addr : server_addr
    }, callback);
}

function get_custom_proxy_server(callback) {
    "use strict";
    background.get_storage('custom_proxy_server', function(server_info) {
        if (typeof server_info === 'undefined'
            || typeof server_info.proc === 'undefined'
            || typeof server_info.addr === 'undefined') {
            callback(/*custom_enabled=*/false, default_proxy_server_proc, default_proxy_server_addr);
        } else {
            callback(/*custom_enabled=*/true, server_info.proc, server_info.addr);
        }
    });
}

function test_custom_proxy_server(callback) {
    "use strict";
    var test_url = 'http://ipservice.163.com/isFromMainland';
    show_proxy_test_message('info', 'Testing connection & Unblock...');
    $.get(test_url, function(data) {
        if (data === 'true') {
            show_proxy_test_message('success', 'Unblock OK.');
        } else {
            show_proxy_test_message('danger', 'Unblock test failed! Invalid config or server not located in mainland China.');
        }
    }).error(function() {
        show_proxy_test_message('danger', 'Unblock test failed! Invalid config or server not working properly.');
    });
}

$(document).ready(function() {
    "use strict";
    get_custom_proxy_server(function(custom_enabled, server_proc, server_addr) {
        $('#custom_proxy_proc option').each(function(idx, d) {
            if (d.value === server_proc) {
                d.selected = true;
            }
        });
        $('#custom_proxy_addr').val(server_addr);
        if (custom_enabled === true) {
            $('#custom_proxy_proc').attr('disabled', true);
            $('#custom_proxy_addr').attr('disabled', true);
            $('#custom_proxy_enable').attr('disabled', true);
            background.get_mode_name(function(current_mode) {
                if (current_mode === 'normal') {
                    show_proxy_message('info', 'Status: Enabled');
                } else {
                    show_proxy_message('warning', 'Status: Enabled. But current mode is not proxy mode.');
                }
            });
        } else {
            show_proxy_message('info', 'Status: NOT Enabled');
            $('#custom_proxy_reset').attr('disabled', true);
        }
    });

    $('#custom_proxy_enable').click(function() {
        var custom_proxy_proc = $('#custom_proxy_proc').val();
        var custom_proxy_addr = $('#custom_proxy_addr').val();
        $('#custom_proxy_proc').attr('disabled', true);
        $('#custom_proxy_addr').attr('disabled', true);
        $('#custom_proxy_enable').attr('disabled', true);
        set_custom_proxy_server(custom_proxy_proc, custom_proxy_addr, function() {
            // switch to proxy mode and force refresh pac proxy 
            background.get_mode_name(function(current_mode) {
                if (current_mode === 'normal') {
                    background.setup_proxy();
                    $('#custom_proxy_reset').attr('disabled', false);
                    show_proxy_message('info', 'Enabled custom proxy server.');
                    test_custom_proxy_server();
                } else {
                    background.set_mode_name('normal', function() {
                        $('#custom_proxy_reset').attr("disabled", false);
                        show_proxy_message('warning', 'Enabled custom proxy server, and changed to proxy mode.');
                        test_custom_proxy_server();
                    });
                }
            });
        });
    });

    $('#custom_proxy_reset').click(function() {
        $("#custom_proxy_reset").attr('disabled', true);
        remove_custom_proxy_server(function() {
            // switch to proxy mode and force refresh pac proxy 
            background.get_mode_name(function(current_mode) {
                if (current_mode === 'normal') {
                    background.setup_proxy();
                    $('#custom_proxy_proc').attr('disabled', false);
                    $('#custom_proxy_addr').attr('disabled', false);
                    $('#custom_proxy_enable').attr('disabled', false);
                    show_proxy_message('warning', 'Reset custom proxy server.');
                    test_custom_proxy_server();
                } else {
                    background.set_mode_name('normal', function() {
                        $('#custom_proxy_proc').attr('disabled', false);
                        $('#custom_proxy_addr').attr('disabled', false);
                        $('#custom_proxy_enable').attr('disabled', false);
                        show_proxy_message('warning', 'Reset custom proxy server, and changed to proxy mode.');
                        test_custom_proxy_server();
                    });
                }
            });
        });
    });

    $('#form_custom_proxy_server').submit(function(event) {
        // prevent the default action of submitting a form
        event.preventDefault();
    });
});
