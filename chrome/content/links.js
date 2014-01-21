/*
 * Let you smoothly surf on many websites blocking non-mainland visitors.
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
/*global chrome: false */
"use strict";

chrome.storage.sync.get('support_us', function(items) {
    if (items.support_us === 'yes') {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerText = "var vglnk = vglnk || {api_url: '//api.viglink.com/api', key: '0dff9ade2d1125af6c910069b6d6e155', reaffiliate: false};";
        document.body.appendChild(s);

        s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'http://cdn.viglink.com/api/vglnk.js';
        document.body.appendChild(s);
    }
});
