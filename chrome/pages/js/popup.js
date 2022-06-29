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


function set_i18n_text() {
    "use strict";
    var get_msg = chrome.i18n.getMessage;

    $('div#support strong').html(get_msg('support_title'));
    $('p#support_message').html(get_msg('support_message'));
    $('a#support_link').attr('href', get_msg('donation_url'));
    $('button#support_button').html(get_msg('support_button'));

    $('div#social strong').html(get_msg('social_title'));

    $('div#mode_select strong').html(get_msg('mode_select'));

    $('span.mode_off_name').html(get_msg('mode_off'));
    $('span.mode_off_desc').html(get_msg('mode_off_description'));
    $('span.mode_normal_name').html(get_msg('mode_normal'));
    $('span.mode_normal_desc').html(get_msg('mode_normal_description'));

    $('div#faq').html(get_msg('faq'));
    $('div#feedback').html(get_msg('feedback'));
    $('div#rating').html(get_msg('rating'));
}

$(document).ready(function() {
    "use strict";
    set_i18n_text();

    var background = chrome.extension.getBackgroundPage();

    // set default button display
    background.get_mode_name(function(current_mode_name) {
        switch (current_mode_name) {
            case 'off':
                $('label#off').addClass('active');
                break;
            default:
                $('label#normal').addClass('active');
                break;
        }
    });


    chrome.browserAction.setBadgeText({text: ''});  // clear the text NEW
    background.get_storage('previous_new_version', function(version) {
        if (typeof version === 'undefined' || version !== background.unblock_youku.lastest_new_version) {
            background.set_storage('previous_new_version', background.unblock_youku.lastest_new_version);
        }
    });

    $('div#version small').html('Unblock Youku v' + background.unblock_youku.version);

    // button actions
    $('input#input_off').change(function() {
        console.log('to change mode to off');
        background.change_mode('off');
    });
    $('input#input_normal').change(function() {
        console.log('to change mode to normal');
        background.change_mode('normal');
    });

    // enable tooltip
    $('#tooltip').tooltip();
});

