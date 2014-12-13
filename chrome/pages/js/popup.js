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

/*jslint browser: true */
/*global $: false, chrome: false, ga_report_event: false */

function set_i18n_text() {
    "use strict";
    var get_msg = chrome.i18n.getMessage;

    $('div#mode_select strong').html(get_msg('mode_select'));

    $('span.mode_lite_name').html(get_msg('mode_lite'));
    $('span.mode_lite_desc').html(get_msg('mode_lite_description'));
    $('span.mode_normal_name').html(get_msg('mode_normal'));
    $('span.mode_normal_desc').html(get_msg('mode_normal_description'));
    $('span.mode_redirect_name').html(get_msg('mode_redirect'));
    $('span.mode_redirect_desc').html(get_msg('mode_redirect_description'));

    $('div#help_text').html(get_msg('help'));
    $('div#feedback').html(get_msg('feedback'));
    $('div#rating').html(get_msg('rating'));
    $('span#sharing_text').html(get_msg('sharing'));
    
    $('div#support_title strong').html(get_msg('support_title'));
    $('span#support_checkbox_label').html(get_msg('support_checkbox_label'));
}

function is_flash_bug_fixed() {
    return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0 || parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10) >= 38;
}


$(document).ready(function() {
    "use strict";
    set_i18n_text();

    var background = chrome.extension.getBackgroundPage();

    // set default button display
    background.get_mode_name(function(current_mode_name) {
        switch (current_mode_name) {
            case 'lite':
                $('label#lite').addClass('active');
                break;
            case 'redirect':
                $('label#redirect').addClass('active');
                break;
            default:
                $('label#normal').addClass('active');
                break;
        }

        // append system info to the wufoo feedback link
        // such as extension version, chrome version, and os type
        var locale = navigator.language.substr(0, 2);
        if (locale === 'en' || locale === 'zh') {
            // jQuery.browser is not always accurate
            var system_info = 'Unblock Youku ' + background.unblock_youku.version;
            system_info += ' (' + current_mode_name + ', ' + locale + '); ';
            system_info += navigator.userAgent;
            console.log(system_info);
            system_info = encodeURIComponent(system_info).replace(/%2F/g, '/');  // NOTICEME
            console.log(system_info);

            var feedback_url = $('#feedback a');
            feedback_url.prop('href', feedback_url.prop('href') + '/def/field13=' + system_info);
        }
    });

    // check whether the browser is Opera, or Chrome version >= 38, to get around Flash bug in Chrome
    // https://github.com/zhuzhuor/Unblock-Youku/issues/209
    if(!is_flash_bug_fixed()) {
        $('#redirect').addClass('disabled');
        $('#input_redirect').attr('disabled', true);

        // $('#buttons').tooltip({html: true, title: chrome.i18n.getMessage('mode_redirect_disabled')});
        // $('#input_redirect').tooltip({html: true, title: chrome.i18n.getMessage('mode_redirect_disabled')});
        $('.mode_redirect_desc').parents('tr').addClass('text-muted').tooltip({html: true, title: chrome.i18n.getMessage('mode_redirect_disabled')});

        // if current mode is redirect, change to normal mode
        background.get_mode_name(function(current_mode_name) {
            if(current_mode_name === 'redirect') {
                $('#normal').click();
            }
        });
    }

    var pre_heart_icon = '<i class="fa fa-heart" style="color: PaleVioletRed;"></i>&nbsp;';

    background.get_storage('support_us', function(option) {
        if (option === 'yes') {
            $('#support_checkbox input').prop('checked', true);
            $('div#support_message').html(pre_heart_icon + chrome.i18n.getMessage('support_message_yes'));
        } else {
            $('#support_checkbox input').prop('checked', false);
            $('div#support_message').html(chrome.i18n.getMessage('support_message_no'));
        }
    });

    $('#support_checkbox input').click(function() {
        if ($('#support_checkbox input').prop('checked')) {
            background.set_storage('support_us', 'yes', function() {
                $('div#support_message').html(pre_heart_icon + chrome.i18n.getMessage('support_message_yes'));
                console.log('change to support us');
                ga_report_event('Change Support', 'Yes');
            });
        } else {
            background.set_storage('support_us', 'no', function() {
                $('div#support_message').html(chrome.i18n.getMessage('support_message_no'));
                console.log('change to not support us');
                ga_report_event('Change Support', 'No');
            });
        }
    });

    chrome.browserAction.setBadgeText({text: ''});  // clear the text NEW
    background.get_storage('previous_new_version', function(version) {
        if (typeof version === 'undefined' || version !== background.unblock_youku.lastest_new_version) {
            background.set_storage('previous_new_version', background.unblock_youku.lastest_new_version);
        }
    });

    // $('div#version').html('Unblock Youku </i> ' + background.unblock_youku.version);

    // button actions
    $('input#input_lite').change(function() {
        console.log('to change mode to lite');
        background.change_mode('lite');
    });
    $('input#input_normal').change(function() {
        console.log('to change mode to normal');
        background.change_mode('normal');
    });
    $('input#input_redirect').change(function() {
        console.log('to change mode to redirect');
        background.change_mode('redirect');
    });
	
    var my_date = new Date();
    if (typeof localStorage.first_time === 'undefined') {
        localStorage.first_time = my_date.getTime();
    } else if (my_date.getTime() > parseInt(localStorage.first_time, 10) + 1000 * 60 * 60 * 24 * 3) {
        $('div#rating').show(); // delay 3 days for the rating div to show up, hahaha
    }
});

