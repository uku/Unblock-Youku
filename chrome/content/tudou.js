/*
 * Copyright (C) 2012 - 2014  Bo Zhu  http://zhuzhu.org
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
"use strict";

var s = document.createElement('script');
s.type = 'text/javascript';
s.innerText = ' \
    (function() { \
        var i, list = document.getElementsByTagName("object"); \
        for (i = 0; i < list.length; i++) { \
            list[i].innerHTML = list[i].innerHTML.replace("tvcCode=5001", "tvcCode=-1"); \
        } \
    }());';
document.body.appendChild(s);
