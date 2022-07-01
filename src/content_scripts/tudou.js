'use strict';

const s = document.createElement('script');
s.type = 'text/javascript';
s.innerText = ' \
    (function() { \
        var i, list = document.getElementsByTagName("object"); \
        for (i = 0; i < list.length; i++) { \
            list[i].innerHTML = list[i].innerHTML.replace("tvcCode=5001", "tvcCode=-1"); \
        } \
    }());';
document.body.appendChild(s);
