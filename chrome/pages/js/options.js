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
console.log(background.unblock_youku.default_server);
var default_server = background.unblock_youku.default_server;
console.log(default_server);


$('document').ready(function() {
    if (!localStorage.custom_server) {
        localStorage.custom_server = default_server;
    }
    $('input#custom_server').val(localStorage.custom_server);
});


$('button#reset').click(function() {
    localStorage.custom_server = default_server;
    $('input#custom_server').val(localStorage.custom_server);
    $('#message').html('<div class="alert alert-info"><button type="button" class="close" data-dismiss="alert">×</button>Reset to default backend server.</div>');
});

$('button#test').click(function() {
    var test_url = 'http://' + $('input#custom_server').val() + '?url=' + btoa('http://ipservice.163.com/isFromMainland');
    $('#message').html('');
    $.get(test_url, function(data) {
        if (data === 'true') {
            $('#message').html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">×</button>Test passed. Please remember to save the new configuration.</div>');
        } else {
        }
    })
    .error(function() {
        $('#message').html('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">×</button>Test failed! Perhaps the server isn\'t working properly.</div>');
    });
});

$('button#save').click(function() {
    localStorage.custom_server = $('input#custom_server').val();
    $('#message').html('<div class="alert alert-info"><button type="button" class="close" data-dismiss="alert">×</button>New configuration is saved.</div>');
});
