'use strict';

const s = document.createElement('script');
s.type = 'text/javascript';
s.innerText = ' \
  (function() { \
      var i, list = document.getElementsByTagName("script"); \
      for (i = 0; i < list.length; i++) { \
        list[i].innerHTML = list[i].innerHTML.replace(/isForeign[^;]*/gi, "isForeign = \\\"\\\""); \
      } \
      mbox.isForeign = ""; \
      document.body.classList.remove("foreignIP"); \
  }());';

let target = null;
let i; const list = document.getElementsByTagName('script');
for (i = 0; i < list.length; i++) {
  if (list[i].innerHTML.indexOf('isForeign') !== -1) {
    target = list[i];
    break;
  }
}
if (target !== null) {
  target.parentNode.insertBefore(s, target.nextSibling);
} else {
  document.body.appendChild(s);
}
