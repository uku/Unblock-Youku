$(document).ready(function() {
    var background = chrome.extension.getBackgroundPage();

    // set default button display
    switch (background.current_mode()) {
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
    });
    $('#normal').click(function() {
        background.change_mode('normal');
        console.log('changed mode to normal');
    });
    $('#redirect').click(function() {
        background.change_mode('redirect');
        console.log('changed mode to redirect');
    });
});

