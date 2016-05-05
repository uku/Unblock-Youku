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

/*global chrome: false, localStorage: false */
"use strict";


function create_donation_tab() {
    if (typeof localStorage.showed_donation_page !== 'undefined') {
        // Make sure the page is only shown once
        return;
    }

    var donation_url = chrome.i18n.getMessage('donation_url');
    chrome.tabs.create({
        url: donation_url
    });

    // Set the flag such that the page isn't shown again
    localStorage.showed_donation_page = new Date().getTime();
}

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        create_donation_tab();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    create_donation_tab();
});
