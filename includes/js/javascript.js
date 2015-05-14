var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
//var base_url = 'http://localhost:3000';

$(document).ready(function() {

    var $header_height;
    var $footer_height;
    $('.main').ready(function(){
        $header_height = $('header').height();
        $footer_height = $('footer').height();
        var $wrapper_height = $('.wrapper').height();
        var main_height = $wrapper_height - $header_height - $footer_height;
        $('.main').height(main_height);
        $('body, html').height($header_height + main_height + $footer_height);
    });

    $(window).resize(function(){
        if($('.main').height() > 700){
            $('.main').height($('.main .content').height());
            $('body, html').height($header_height + $('.main').height() + $footer_height);
        }
    });

    $('#user-icon').click(function(){
        $('#options-cont').fadeToggle(200);
    });

});
