$(document).ready(function() {

    $('#check-all').click(function() {  //on click
        if(this.checked) { // check select status
            $('.check').each(function() { //loop through each checkbox
                this.checked = true;  //select all checkboxes with class "checkbox1"
            });
        }else{
            $('.check').each(function() { //loop through each checkbox
                this.checked = false; //deselect all checkboxes with class "checkbox1"
            });
        }
    });

    $('#approve-link').click(function(){
        var food_items_arr = [];
        $('.check:checked').each(function(){
            food_items_arr.push($(this).val());
        });
        if(food_items_arr.length == 0) $('.error p').html('לא נבחרו פריטים');
        else link_addition_set_ajax(food_items_arr);
    });

});

function link_addition_set_ajax(food_items_arr){
    //id_params => menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id, addition_type_name
    var id_params = $('.link-addition-type-cont').attr('id').split('-');
    var info = {
        menu_type_id: id_params[0],
        menu_type_name: id_params[1],
        menu_item_id: id_params[2],
        menu_item_name: id_params[3],
        addition_type_id: id_params[4],
        addition_type_name: id_params[5]
    };
    var food_items_id = {
        addition_type_id: info.addition_type_id,
        food_item_arr: food_items_arr
    };
    var url = base_url + '/link-addition-set';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(food_items_id)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-additions&menu_type_id='+info.menu_type_id+'&menu_type_name='+info.menu_type_name+'&menu_item_id='+info.menu_item_id+'&menu_item_name='+info.menu_item_name;
        else $('.error p').html(res.msg);
    });
}