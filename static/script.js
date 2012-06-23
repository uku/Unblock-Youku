$(document).ready(function() {
    // set default button display
    if (localStorage['unblock_youku_mode']) {
        switch (localStorage['mode']) {
        case 'lite':
            $('#lite').button('toggle');
            break;
        case 'redirect':
            $('#redirect').button('toggle');
            break;
        default:
            $('#normal').button('toggle');
        }
    } else {
        localStorage['unblock_youku_mode'] = 'normal';
        $('#normal').button('toggle');
    }
    
    // button actions
    $('#lite').click(function() {
        localStorage['unblock_youku_mode'] = 'lite';
        console.log('changed mode to lite');
    });
    $('#normal').click(function() {
        localStorage['unblock_youku_mode'] = 'normal';
        console.log('changed mode to normal');
    });
    $('#redirect').click(function() {
        localStorage['unblock_youku_mode'] = 'redirect';
        console.log('changed mode to redirect');
    });
});

