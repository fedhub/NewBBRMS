$(document).ready(function() {

    $('.menu-items-cont .item-container').each(function(i){
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

    //id="<%= params.menu_type_name %>-<%= params.menu_type_id %>-<%= params.menu_item_name %>-<%= params.menu_item_id %>">
    $('.image-cont').click(function(){
        var image_id = $(this).attr('id');
        var id_params = $('.edit-menu-item-cont').attr('id').split('-');
        var menu_item_id = id_params[3];
        var menu_type_id = id_params[1];
        var menu_type_name = id_params[0];
        var url = base_url + '/update-food-item-image&menu_type_id='+menu_item_id+'&image_id='+image_id;
        $.ajax({
            url: url,
            type: 'POST'
        }).done(function(res){
            if(!res.status) console.log('problem');
            else window.location = base_url + '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name;
        });
    });

});