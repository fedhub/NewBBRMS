//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#active-1').toggle();

    var name = $('#name').val();
    var price = $('#price').val();
    var description = $('#description').val();

    $('#save-details').click(function(){

        var id = $(this).parent().parent().parent().attr('id');
        console.log(id);

        var new_name = $('#name').val();
        var new_price = $('#price').val();
        var new_description = $('#description').val();
        var msg = '';
        if(new_name.length == 0) msg += 'הזן שם פריט. ';
        if(new_price.length == 0) msg +=  'הזן מחיר לפריט. ';
        if(!new_price.match(/^\d+$/)) msg += 'מחיר צריך להיות מורכב רק מספרות. ';
        if(name == new_name && price == new_price && description == new_description) msg += 'לא בוצעו שינויים';
        if(msg.length > 0) alert(msg);
        else update_details_ajax(new_name, new_price, new_description);
    });

});

function update_details_ajax(new_name, new_price, new_description){
    var url = base_url + '/update-addition-item-details';
    var id_params = $('.edit-addition-item-cont').attr('id').split('-');

    var params = {
        menu_type_id: id_params[0],
        menu_type_name: id_params[1],
        menu_item_id: id_params[2],
        menu_item_name: id_params[3],
        addition_item_name: new_name,
        addition_item_id: id_params[4],
        addition_item_price: new_price,
        addition_item_description: new_description
    };

    var info = {
        name: new_name,
        price: new_price,
        description: new_description
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status){}
        else{}
    });
}