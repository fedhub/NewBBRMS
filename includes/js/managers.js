//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

$(document).ready(function() {

    var $msg_box = $('<div>', {
        class: 'msg'
    }).append($('<p>'));

    $('#managers').click(function(){
        check_if_admin_ajax('/managers');
    });

    $('#close-error-page').click(function(){
        $('#error-page').fadeOut(function(){
            location.reload();
        });
    });

    var selected_array = [];
    $('select').each(function(){
        var admin_state = $(this).attr('id');
        if(admin_state == '0'){
            $(this).find('option').eq(0).prop('selected', true);
            selected_array.push(0);
        }
        if(admin_state == '1'){
            $(this).find('option').eq(1).prop('selected', true);
            selected_array.push(1);
        }
    });

    $('.save').click(function(e){
        var index = $(this).parent().index()-1; // the row index
        var id = $(e.target).attr('id');
        var manager_id = id.split('-')[1]; // the manager id in the database
        var new_admin_state = $('.manager-item').eq(index).find('select').val(); // the updated selection of admin state
        if(new_admin_state == selected_array[index]){
            $msg_box.find('p').html('לא בוצע שינוי');
            $(this).append($msg_box);
            $msg_box.fadeIn().delay(500).fadeOut(function(){
                $msg_box.remove();
            });
        }
        else get_manager_id_ajax($(this), $msg_box, index, manager_id, new_admin_state, 'save');
    });

    $('.delete').click(function(e){
        var index = $(this).parent().index()-1; // the row index
        var id = $(e.target).attr('id');
        var manager_id = id.split('-')[1]; // the manager id in the database
        get_manager_id_ajax($(this), $msg_box, index, manager_id, false, 'delete');
    });

    $('#add-manager').click(function(){
        check_if_admin_ajax('/add-manager');
    });

    $('#approve-manager-addition').click(function(){
        $('#manager-addition-error').empty();
        var $msg_box = $('#manager-addition-error');
        var empty_msg = is_empty_input();
        if(empty_msg.length > 0) $msg_box.html(empty_msg);
        else{
            var manager = get_manager_obj();
            add_manager_ajax(manager);
        }
    });

});

function check_if_admin_ajax(path){
    var url = base_url += '/is-admin-check';
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res) window.location = path;
        else not_admin_handler();
    });
}

function not_admin_handler(){
    $('#error-msg').html('אין לך הרשאות משתמש מתאימות עבור ניהול המנהלים, הגישה נחסמה');
    $('#error-page').fadeIn();
}

function get_manager_id_ajax(elm, $msg_box, index, manager_id, new_admin_state, action){
    var url = base_url + '/manager-id&test_id=' + manager_id;
    var msg = '';
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res) {  // can't delete himself
            if(action == 'delete') msg += 'אינך רשאי למחוק את עצמך';
            if(action == 'save') msg += 'אינך רשאי לשנות הרשאות לעצמך';
            $msg_box.find('p').html(msg);
            elm.eq(index).append($msg_box);
            $msg_box.fadeIn().delay(500).fadeOut(function(){
                $msg_box.remove();
            });
        }
        else{
            if(action == 'delete') window.location = '/delete-manager&manager_id='+manager_id;
            if(action == 'save')  window.location = '/update-admin&manager_id='+manager_id+'&admin_state='+new_admin_state;
        }
    });
}

function is_empty_input(){
    var msg = '';
    if($('input').eq(0).val().length == 0) msg += 'הזן שם פרטי. ';
    if($('input').eq(1).val().length == 0) msg += 'הזן שם משפחה. ';
    if($('input').eq(2).val().length == 0) msg += 'הזן מספר טלפון. ';
    if($('input').eq(3).val().length == 0) msg += 'הזן כתובת דוא"ל. ';
    if($('input').eq(4).val().length == 0) msg += 'הזן שם משתמש. ';
    if($('input').eq(5).val().length == 0) msg += 'הזן סיסמה. ';
    return msg;
}

function get_manager_obj(){
    return {
        first_name: $('input').eq(0).val(),
        last_name: $('input').eq(1).val(),
        phone_number: $('input').eq(2).val(),
        email: $('input').eq(3).val(),
        username: $('input').eq(4).val(),
        password: $('input').eq(5).val(),
        admin: $('#admin-selection').val()
    }
}

function add_manager_ajax(manager){
    var url = base_url + '/add-manager-fire';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(manager)}
    }).done(function(res){
        if(!res) $('#manager-addition-error').html('הייתה בעיה בהוספת המנהל החדש, אנא נסה שוב מאוחר יותר');
        else window.location = '/managers';
    });
}