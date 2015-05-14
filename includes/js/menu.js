var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
//var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('.menu-types-cont .item-container, .menu-items-cont .item-container, .additions-set-items .item-container').mouseenter(function(){
        $(this).find('.footer').toggleClass('top');
    });

    $('.menu-types-cont .item-container, .menu-items-cont .item-container, .additions-set-items .item-container').mouseleave(function(){
        $(this).find('.footer').toggleClass('top');
    });

    $('.menu-types-cont .item-container').click(function(){
        var menu_type_id = $(this).attr('id').split('-')[2];
        var menu_type_name = $(this).find('.header p').text();
        window.location = '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name;
    });

    $('.menu-items-cont .item-container').click(function(){
        var query_arr = $(this).attr('id').split('-');
        var menu_type_id = query_arr[1];
        var menu_type_name = query_arr[0];
        var menu_item_id = query_arr[3];
        var menu_item_name = query_arr[2];
        window.location = '/menu-additions&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name+'&menu_item_id='+menu_item_id+'&menu_item_name='+menu_item_name;
    });

});