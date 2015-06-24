$(document).ready(function() {

    $('#save-details').click(function(){
        var data = init();
        var msg = check_inputs(data);
        if(msg.length > 0) alert(msg);
        else add_menu_item_ajax(data);
    });

});

function init(){
    return {
        menu_type_name: $('#menu-type #name').val(),
        menu_item_name: $('#menu-item #name').val(),
        menu_item_price: $('#menu-item #price').val(),
        menu_item_description: $('#menu-item #description').val(),
        addition_type_name: $('#addition-type #name').val(),
        addition_type_description: $('#addition-type #description').val(),
        selection_type: $('#addition-type #selection-type').val(),
        selections_amount: 1,
        addition_item_name: $('#addition-item #name').val(),
        addition_item_price: $('#addition-item #price').val(),
        addition_item_description: $('#addition-item #description').val()
    };
}

function check_inputs(data){
    var msg = '';
    if(data.menu_type_name.length == 0) msg += 'הזן שם לסוג התפריט. ';
    if(data.menu_item_name.length == 0) msg += 'הזן שם לפריט. ';
    if(data.menu_item_price.length == 0) msg += 'הזן מחיר לפריט. ';
    if(data.addition_type_name.length == 0) msg += 'הזן שם לסט התוספות. ';
    if(data.addition_item_name.length == 0) msg += 'הזן שם לפריט התוספת. ';
    if(data.addition_item_price.length == 0) msg += 'הזן מחיר לפריט התוספת. ';
    if(!(/^\d+$/).test(data.addition_item_price) || !(/^\d+$/).test(data.menu_item_price)) msg += 'מחיר צריך להיות מורכב רק מספרות. ';
    return msg;
}

function add_menu_item_ajax(data){
    var url = base_url + '/add-menu-type';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(data)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-types';
        else alert(res.msg);
    })
}

