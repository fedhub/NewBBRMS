$(document).ready(function() {

    $('.menu-additions-cont .additions-set-items').each(function(i){
        $(this).find('.item-container').each(function(j){
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
        });
    });

    //id="<%= params.menu_type_id %>-<%= params.menu_type_name %>-<%= params.menu_item_id %>-<%= params.menu_item_name %>">
    //$('.image-cont').click(function(){
    //    var image_id = $(this).attr('id');
    //    var id_params = $('.edit-addition-item-cont').attr('id').split('-');
    //    var menu_type_id = id_params[0];
    //    var menu_type_name = id_params[1];
    //    var menu_item_id = id_params[2];
    //    var menu_item_name = id_params[3];
    //    var addition_item_id = id_params[4];
    //    var url = base_url + '/update-addition-item-image&addition_item_id='+addition_item_id+'&image_id='+image_id;
    //    $.ajax({
    //        url: url,
    //        type: 'POST'
    //    }).done(function(res){
    //        if(!res.status) console.log('problem');
    //        else window.location = base_url + '/menu-additions&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name+'&menu_item_id='+menu_item_id+'&menu_item_name='+menu_item_name;
    //    });
    //});

});