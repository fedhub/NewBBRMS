$(document).ready(function() {

    var height = $(document).height();
    var width = $(document).width();
    $('body').css('height', height);
    $('body').css('width', width);
    $('iframe').css({'height': '100%',
    'width': '100%',
    '-moz-transform': 'scale(0.25, 0.25)',
    '-webkit-transform': 'scale(0.25, 0.25)',
    '-o-transform': 'scale(0.25, 0.25)',
    '-ms-transform': 'scale(0.25, 0.25)',
    'transform': 'scale(0.25, 0.25)',
    '-moz-transform-origin': 'top left',
    '-webkit-transform-origin': 'top left',
    '-o-transform-origin': 'top left',
    '-ms-transform-origin': 'top left',
    'transform-origin': 'top left'});

});
