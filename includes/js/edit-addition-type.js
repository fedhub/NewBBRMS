var old_selection_type, old_selections_amount, old_name;
var new_selection_type, new_description, new_selections_amount, new_name;
$(document).ready(function() {

    old_selection_type = $('select:nth-of-type(1)').attr('id').split('-')[2];
    $('select:nth-of-type(1)').val(old_selection_type);

    old_selections_amount = $('select:nth-of-type(2)').attr('id').split('-')[2];
    $('select:nth-of-type(2)').val(old_selections_amount);

    old_name = $('#name').val();

    $('#save-details').click(function(){
        var msg = check_inputs();
        if(msg.length > 0) alert(msg);
        else update_addition_type_ajax();
    });

});

function check_inputs(){
    var msg = '';
    new_name = $('#name').val();
    new_description = $('#description').val();
    new_selection_type = $('select:nth-of-type(1) :selected').val();
    new_selections_amount = $('select:nth-of-type(2) :selected').val();
    if(new_name.length == 0) msg += 'הזן שם. ';
    else{
        if(new_name == old_name && new_selection_type == old_selection_type && new_selections_amount == old_selections_amount)
            msg += 'לא בוצעו שינויים';
    }
    return msg;
}

function update_addition_type_ajax(){
    var url = base_url + '/update-addition-type';
    var id_params = $('.edit-addition-type-cont').attr('id').split('-');
    var info = {
        new_name: new_name,
        new_description: new_description,
        new_selection_type: new_selection_type,
        new_selections_amount: new_selections_amount,
        addition_type_id: id_params[4]
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-additions&menu_type_id='+id_params[0]+'&menu_type_name='+id_params[1]+'&menu_item_id='+id_params[2]+'&menu_item_name='+id_params[3];
        else alert(res.msg);
    })
}

