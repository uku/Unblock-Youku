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


// have to use a callback function
function get_storage(key, callback) {
    // there is some bug in the chrome.storage api
    // see https://github.com/zhuzhuor/Unblock-Youku/issues/45
    // and http://code.google.com/p/chromium/issues/detail?id=158971
    // but we can't reproduce the similar erros
    // so here we just try to be more carefull
    // although we can't test if the try...catch thing works

    try {
        chrome.storage.sync.get(key, function(items) {
            callback(items[key]);
        });
    } catch (err) {
        console.error(err);
        _gaq.push(['_trackEvent', 'Storage API Error', key]);
        callback(localStorage[key]);
    }
}


function set_storage(key, value, callback) {
    try {
        var obj = {};
        obj[key] = value;  // can't just use {key: value}
        chrome.storage.sync.set(obj, callback);
    } catch (err) {
        console.error(err);
        if (key === 'unblock_youku_mode') {
            fallback_change_mode(value, callback);
        } else {
            localStorage[key] = value;
            callback();
        }
    }
}


// if the storage api fails, we couldn't count on onChange listener
// we have to reset the mode settings by ourselves
function fallback_change_mode(new_mode_name, callback) {
    get_storage('unblock_youku_mode', function(old_mode_name) {
        // only alter the settings if there is an old one
        // in case that it's the first time install the extension
        console.warn('fallback_change_mode changes mode ' + old_mode_name + ' -> ' + new_mode_name);
        if (typeof old_mode_name !== 'undefined') {
            clear_mode_settings(old_mode_name);
            setup_mode_settings(new_mode_name);
        }
        localStorage.unblock_youku_mode = new_mode_name;
        callback();
    });
}


function remove_storage(key, callback) {
    try {
        chrome.storage.sync.remove(key, callback);
    } catch (err) {
        localStorage.removeItem(key);
        callback();
    }
}


(function migrate_storage(list_keys) {
    var old_keys = [];
    for (var i in list_keys) {
        var key = list_keys[i];
        if (typeof localStorage[key] !== 'undefined') {
            old_keys.push(key);
        }
    }

    try {
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
    } catch (err) {
        console.error(err);
    }
})(['unblock_youku_mode', 'custom_server', 'test']);

