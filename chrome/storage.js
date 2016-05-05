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

/*global chrome: false */
"use strict";

// have to use a callback function
function get_storage(key, callback) {
    chrome.storage.sync.get(key, function(items) {
        if (typeof items !== 'undefined' && items.hasOwnProperty(key)) {
            callback(items[key]);
        } else {
            callback();
        }
    });
}


function set_storage(key, value, callback) {
    var obj = {};
    obj[key] = value;  // can't just use {key: value}
    chrome.storage.sync.set(obj, callback);
}


function remove_storage(key, callback) {
    chrome.storage.sync.remove(key, callback);
}