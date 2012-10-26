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
    if (chrome.storage) {
        chrome.storage.sync.get(key, function(items) {
            callback(items[key]);
        });
    } else {
        callback(localStorage[key]);
    }
}


function set_storage(key, value, callback) {
    if (chrome.storage) {
        var obj = {};
        obj[key] = value;  // can't just use {key: value}
        chrome.storage.sync.set(obj, callback);
    } else {
        localStorage[key] = value;
        callback();
    }
}


(function migrate_storage(list_keys) {
    if (!chrome.storage) {
        return;
    }

    var old_keys = [];
    for (var i in list_keys) {
        var key = list_keys[i];
        if (typeof localStorage[key] !== 'undefined') {
            old_keys.push(key);
        }
    }

    chrome.storage.sync.get(old_keys, function(items) {
        var settings = {};
        for (var i in old_keys) {
            var key = old_keys[i];
            if (typeof items[key] === 'undefined') {
                settings[key] = localStorage[key];
            }
        }
        if (Object.keys(settings).length > 0) {  // learnt from http://goo.gl/uMfJ0
            chrome.storage.sync.set(settings, function() {
                console.log('migrated old settings as follows');
                console.log(settings);
            });
        }
    });
})(['unblock_youku_mode', 'test']);


// also need to add the listener for the case that settings are synced and thus changed in background
chrome.storage.onChanged.addListener(function(changes, area) {
    if (typeof changes.unblock_youku_mode !== 'undefined') {
        var mode_change = changes.unblock_youku_mode;

        if (typeof mode_change.oldValue !== 'undefined') {
            console.log('need to clear old settings');
        }

        if (typeof mode_change.newValue !== 'undefined') {
            console.log('need to set up new mode');
        } else {
            console.log('should never reach here');
        }
    }
});

