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

    $('.additions-set-title .edit').click(function () {
        //menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id
        var id_params = $(this).attr('id').split('-');
        var addition_type_name = $(this).parent().find('.name').text().split(' ');
        var addition_type_name_str = '';
        if (addition_type_name.length > 1) {
            for (var i = 0; i < addition_type_name.length - 1; i++) {
                addition_type_name_str += addition_type_name[i] + ' ';
            }
        }
        else addition_type_name_str = addition_type_name[0];
        addition_type_name_str = addition_type_name_str.substr(0, addition_type_name_str.length - 1);
        edit_addition_type_ajax(id_params, addition_type_name_str);
    });

    $('.additions-set-title .delete').click(function(){
        //menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id
        var id_params = $(this).attr('id').split('-');
        var addition_type_name = $(this).parent().find('.name').text().split(' ');
        var addition_type_name_str = '';
        if(addition_type_name.length > 1){
            for(var i = 0; i < addition_type_name.length-1; i++){
                addition_type_name_str += addition_type_name[i] + ' ';
            }
        }
        else addition_type_name_str = addition_type_name[0];
        addition_type_name_str = addition_type_name_str.substr(0, addition_type_name_str.length-1);
        delete_addition_type_ajax(id_params, addition_type_name_str);
    });

    $('.additions-set-title .add').click(function(){
        //menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id
        var id_params = $(this).attr('id').split('-');
        add_addition_type_ajax(id_params);
    });

    $('.additions-set-title .link').click(function(){
        //menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id
        var id_params = $(this).attr('id').split('-');
        var addition_type_name = $(this).parent().find('.name').text().split(' ');
        var addition_type_name_str = '';
        if(addition_type_name.length > 1){
            for(var i = 0; i < addition_type_name.length-1; i++){
                addition_type_name_str += addition_type_name[i] + ' ';
            }
        }
        else addition_type_name_str = addition_type_name[0];
        addition_type_name_str = addition_type_name_str.substr(0, addition_type_name_str.length-1);
        link_addition_type_ajax(id_params, addition_type_name_str);
    });

});

function edit_addition_type_ajax(id_params, addition_type_name){
    var info = get_info(id_params, addition_type_name);
    window.location = base_url + '/edit-addition-type-page&parameters='+encodeURIComponent(JSON.stringify(info));
}

function delete_addition_type_ajax(id_params, addition_type_name){
    var info = get_info(id_params, addition_type_name);
    window.location = base_url + '/delete-addition-types&parameters='+encodeURIComponent(JSON.stringify(info));
}

function link_addition_type_ajax(id_params, addition_type_name){
    var info = get_info(id_params, addition_type_name);
    window.location = base_url + '/link-addition-type-page&parameters='+encodeURIComponent(JSON.stringify(info));
}

function add_addition_type_ajax(id_params){
    var info = get_data(id_params);
    window.location = base_url + '/add-addition-type-page&parameters='+encodeURIComponent(JSON.stringify(info));
}

function get_info(id_params, addition_type_name){
    return {
        menu_type_id: id_params[1],
        menu_type_name: id_params[2],
        menu_item_id: id_params[3],
        menu_item_name: id_params[4],
        addition_type_id: id_params[5],
        addition_type_name: addition_type_name
    };
}

function get_data(id_params){
    return {
        menu_type_id: id_params[1],
        menu_type_name: id_params[2],
        menu_item_id: id_params[3],
        menu_item_name: id_params[4]
    };
}