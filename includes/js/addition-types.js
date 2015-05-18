//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';
$(document).ready(function() {

    $('.additions-set-title .delete').click(function(){
        //menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id
        var id_params = $(this).attr('id').split('-');
        addition_type_ajax(id_params);
    });

});

function addition_type_ajax(id_params){
    var info = {
        menu_type_id: id_params[1],
        menu_type_name: id_params[2],
        menu_item_id: id_params[3],
        menu_item_name: id_params[4],
        addition_type_id: id_params[5]
    };
    var url = base_url + '/addition-types';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(!res){}
        else{}
    });
}