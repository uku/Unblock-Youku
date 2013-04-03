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

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-30726750-4']);
_gaq.push(['_trackPageview']);

(function() {
    "use strict";
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
}());


// see http://goo.gl/QLJu6 and http://goo.gl/aNH3H
window.onerror = function(message, file, line) {
    "use strict";
    var msg = file + '(' + line + '): ' + message;
    console.error(msg);
    _gaq.push(['_trackEvent', 'Unknown Error', msg]);
};
