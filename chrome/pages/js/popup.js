/*
 * Let you smoothly surf on many websites blocking non-mainland visitors.
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

    $('#mode_select strong').html(getMsg('mode_select'));
    $('.mode_lite').html(getMsg('mode_lite'));
    $('.mode_normal').html(getMsg('mode_normal'));
    $('.mode_redirect').html(getMsg('mode_redirect'));
    $('#mode_lite_description').html(getMsg('mode_lite_description'));
    $('#mode_normal_description').html(getMsg('mode_normal_description'));
    $('#mode_redirect_description').html(getMsg('mode_redirect_description'));
    $('#help').html(getMsg('help'));
    $('#feedback').html(getMsg('feedback'));
    $('#rating').html(getMsg('rating'));
    $('#sharing span:first-child').html(getMsg('sharing'));
}


$(document).ready(function() {
    setText();

    var background = chrome.extension.getBackgroundPage();

    // set default button display
    background.get_mode_name(function(current_mode_name) {
        switch (current_mode_name) {
            case 'lite':
                $('#lite').addClass('active');
                break;
            case 'redirect':
                $('#redirect').addClass('active');
                break;
            default:
                $('#normal').addClass('active');
                break;
        }
    });
    
    // button actions
    $('#lite').click(function() {
        console.log('to change mode to lite');
        background.change_mode('lite');
    });
    $('#normal').click(function() {
        console.log('to change mode to normal');
        background.change_mode('normal');
    });
    $('#redirect').click(function() {
        console.log('to change mode to redirect');
        background.change_mode('redirect');
    });
	
    var my_date = new Date();
    if (typeof localStorage.first_time === 'undefined') {
        localStorage.first_time = my_date.getTime();
    } else if (my_date.getTime() > localStorage.first_time + 1000 * 60 * 60 * 24 * 3) {
        $('#rating').show(); // delay 3 days for the rating div to show up, hahaha
    }
});

