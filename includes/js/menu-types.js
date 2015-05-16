$(document).ready(function() {

    $('.menu-types-cont .item-container').each(function(i){
        var $sealed_cont = $(this).find('.sealed-cont');
        var sealed_val = $sealed_cont.attr('id');
        $sealed_cont.attr('title', '');
        if(sealed_val == '1'){
            var $reveal_button = $(this).find('#reveal');
            $sealed_cont.css('display', 'block');
            $sealed_cont.attr('title', 'מוסתר באפליקצייה');
            $reveal_button.css('display', 'block');
            $reveal_button.attr('title', 'חשוף באפליקצייה');
        }
    })

});