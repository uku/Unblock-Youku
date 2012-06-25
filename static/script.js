$(document).ready(function() {
    var background = chrome.extension.getBackgroundPage();


    // set default button display
    switch (background.get_current_mode()) {
    case 'lite':
        $('#lite').button('toggle');
        break;
    case 'redirect':
        $('#redirect').button('toggle');
        break;
    default:
        $('#normal').button('toggle');
        break;
    }
    

    // button actions
    $('#lite').click(function() {
        background.change_mode('lite');
        console.log('changed mode to lite');
        _gaq.push(['_trackEvent', 'Mode Change', 'Lite']);
    });
    $('#normal').click(function() {
        background.change_mode('normal');
        console.log('changed mode to normal');
        _gaq.push(['_trackEvent', 'Mode Change', 'Normal']);
    });
    $('#redirect').click(function() {
        background.change_mode('redirect');
        console.log('changed mode to redirect');
        _gaq.push(['_trackEvent', 'Mode Change', 'Redirect']);
    });


    var my_date = new Date();
    if (!localStorage.first_time) {
        localStorage.first_time = my_date.getTime();
    } else {
        if (my_date.getTime() - localStorage.first_time > 1000 * 60 * 60 * 24 * 3)
            $('#rating').show(); // delay 3 days for the rating div to show up, hahaha
    }
});


// google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-30726750-4']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();
