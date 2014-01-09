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


/*jslint browser: true */

var unblock_youku = unblock_youku || {};


(function() {
    "use strict";
    if (typeof localStorage.uuid === 'undefined') {
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        unblock_youku.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0;
            var v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        localStorage.uuid = unblock_youku.uuid;
    } else {
        unblock_youku.uuid = localStorage.uuid;
    }
}());


function ga_collect_data(type, data) {
    "use strict";
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://www.google-analytics.com/collect', true);
    var payload = 'v=1&' 
                + 'tid=UA-30726750-7&'
                + 'cid='+ unblock_youku.uuid + '&' 
                + 'aip=1&'  // anonymize IP
                + 't=' + type + '&'
                + data;
    xhr.send(payload);
}


function ga_report_event(event_name, event_desc) {
    "use strict";
    var data = 'ec=' + encodeURIComponent(event_name) + '&' 
             + 'ea=' + encodeURIComponent(event_desc);
    ga_collect_data('event', data);
}


function ga_report_ratio(ratio_name, ratio_value) {
    "use strict";
    if (Math.random() < 0.001) {  // reduce data points
        ga_report_event(ratio_name, ratio_value);
    }
}


function ga_report_error(error_name, error_desc) {
    "use strict";
    var data = 'exd=' + encodeURIComponent(error_name) + '&'
             + 'exf=' + encodeURIComponent(error_desc);
    ga_collect_data('exception', data);
}



// see http://goo.gl/QLJu6 and http://goo.gl/aNH3H
window.onerror = function(message, file, line) {
    "use strict";
    var msg = file + '(' + line + '): ' + message;
    console.error(msg);
    ga_report_error('Unknown Error', msg);
};
