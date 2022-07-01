'use strict';

const s = document.createElement('script');
s.type = 'text/javascript';
s.innerText = ' \
    (function() { \
        window.GAbroad=window.contentFrame.GAbroad = false; \
    }());';
document.body.appendChild(s);
