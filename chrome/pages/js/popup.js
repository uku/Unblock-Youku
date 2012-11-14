/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012 Bo Zhu http://zhuzhu.org
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


function setText() {
    var getMsg = chrome.i18n.getMessage;

    $('div#mode_select strong').html(getMsg('mode_select'));
    $('.mode_lite').html(getMsg('mode_lite'));
    $('.mode_normal').html(getMsg('mode_normal'));
    $('.mode_redirect').html(getMsg('mode_redirect'));
    $('td#mode_lite_description').html(getMsg('mode_lite_description'));
    $('td#mode_normal_description').html(getMsg('mode_normal_description'));
    $('td#mode_redirect_description').html(getMsg('mode_redirect_description'));
    $('div#help').html(getMsg('help'));
    $('div#feedback').html(getMsg('feedback'));
    $('div#rating').html(getMsg('rating'));
    $('div#sharing span:first-child').html(getMsg('sharing'));
}


$(document).ready(function() {
    setText();

    var background = chrome.extension.getBackgroundPage();

    // set default button display
    background.get_mode_name(function(current_mode_name) {
        switch (current_mode_name) {
            case 'lite':
                $('button#lite').addClass('active');
                break;
            case 'redirect':
                $('button#redirect').addClass('active');
                break;
            default:
                $('button#normal').addClass('active');
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

            var feedback_url = $('#feedback a');
            feedback_url.prop('href', feedback_url.prop('href') + '/def/field13=' + encodeURIComponent(system_info));
        }
    });

    // button actions
    $('button#lite').click(function() {
        console.log('to change mode to lite');
        background.change_mode('lite');
    });
    $('button#normal').click(function() {
        console.log('to change mode to normal');
        background.change_mode('normal');
    });
    $('button#redirect').click(function() {
        console.log('to change mode to redirect');
        background.change_mode('redirect');
    });
	
    var my_date = new Date();
    if (typeof localStorage.first_time === 'undefined') {
        localStorage.first_time = my_date.getTime();
    } else if (my_date.getTime() > localStorage.first_time + 1000 * 60 * 60 * 24 * 3) {
        $('div#rating').show(); // delay 3 days for the rating div to show up, hahaha
    }
});

