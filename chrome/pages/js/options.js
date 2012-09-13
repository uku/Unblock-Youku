/*
 * Copyright (C) 2012 Bo Zhu http://zhuzhu.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


var background = chrome.extension.getBackgroundPage();
var default_server = background.unblock_youku.default_server;


$('document').ready(function() {
    if (!localStorage.custom_server) {
        localStorage.custom_server = default_server;
    }
    $('input#custom_server').val(localStorage.custom_server);
});


$('button#reset').click(function() {
    localStorage.custom_server = default_server;
    $('input#custom_server').val(localStorage.custom_server);
    show_message('info', 'Reset to default backend server.');
});

$('button#test').click(function() {
    var test_url = 'http://' + $('input#custom_server').val() + '?url=' + btoa('http://ipservice.163.com/isFromMainland');
    show_message('info', 'Waiting...');
    $.get(test_url, function(data) {
        if (data === 'true') {
            show_message('success', 'Test passed. Please remember to save the new configuration.');
        } else {
            show_message('error', 'Test failed! Perhaps your server isn\'t located in mainland China.');
        }
    }).error(function() {
        show_message('error', 'Test failed! Perhaps the server isn\'t working properly.');
    });
});

$('button#save').click(function() {
    localStorage.custom_server = $('input#custom_server').val();
    show_message('info', 'New configuration is saved.');
});


function show_message(type, content) {
    var alert_type = 'info';
    if (type === 'success' || type === 'error') {
        alert_type = type;
    }

    $('#message').html('<div class="alert alert-' + alert_type + '"><button type="button" class="close" data-dismiss="alert">×</button>' + content + '</div>');
}
