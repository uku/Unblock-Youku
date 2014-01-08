/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012, 2013 Bo Zhu http://zhuzhu.org
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

/*global chrome: false */
/*global ga_report_error: false */
"use strict";

function timezone_changer(details) {
    if (details.url.indexOf('timezone') !== -1 && details.url.indexOf('timezone/+08') === -1) {
        console.log('original url: ' + details.url);
        var redirect_url = details.url.replace(/timezone\/.[^\/]*/gi, 'timezone/+08');
        console.log('redirect url: ' + redirect_url);
        return {redirectUrl: redirect_url};
    }

    return {};
}

function setup_timezone() {
    if (!chrome.webRequest.onBeforeRequest.hasListener(timezone_changer)) {
        chrome.webRequest.onBeforeRequest.addListener(
            timezone_changer,
            {urls: ['http://v.youku.com/player/getPlayList*']},
            ["blocking"]
        );
        console.log('timezone_changer is set');
    } else {
        var err_msg = 'timezone_changer is already there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}


function clear_timezone() {
    if (chrome.webRequest.onBeforeRequest.hasListener(timezone_changer)) {
        chrome.webRequest.onBeforeRequest.removeListener(timezone_changer);
        console.log('timezone_changer is removed');
    } else {
        var err_msg = 'timezone_change is not there!';
        console.error(err_msg);
        ga_report_error('Unexpected Error', err_msg);
    }
}

