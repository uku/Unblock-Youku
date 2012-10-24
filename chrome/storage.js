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


// have to use a callback function
function get_storage(key, callback) {
    // a little complicated
    if (chrome.storage) {
        chrome.storage.sync.get(key, function(items) {
            var value = items[key];
            if (typeof value === 'undefined') {
                // preserve the existing settings
                var local_value = localStorage[key];
                if (typeof local_value !== 'undefined') {
                    value = local_value;
                    chrome.storage.sync.set({key: value}, function() {
                        callback(value);
                    });
                } else {
                    callback(value);
                }
            } else {
                callback(value);
            }
        });
    } else {
        callback(localStorage[key]);
    }
}


function set_storage(key, value, callback) {
    if (chrome.storage) {
        chrome.storage.sync.set({key: value}, callback);
    } else {
        localStorage[key] = value;
        callback();
    }
}
