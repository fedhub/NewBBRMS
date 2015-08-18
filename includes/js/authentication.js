var base_url = 'https://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
//var base_url = 'http://localhost:3000';
$(document).ready(function() {

    $('#approve-authentication').click(function(){
        var $username = $('.authentication-wrapper').find('input#username').val();
        var $password = $('.authentication-wrapper').find('input#password').val();
        var $msg_box = $('.authentication-wrapper .error p');
        var msg = '';
        if($username.length == 0) msg += 'אנא הזן שם משתמש. ';
        if($password.length == 0) msg += 'אנא הזן סיסמה. ';
        if(msg.length > 0) $msg_box.html(msg);
        else authenticate_ajax($msg_box, $username, $password);
    });

    $('#log-out, #switch-user, #update-manager-details').click(function() {
        var id = $(this).attr('id');
        if(id == 'update-manager-details') update_manager_details();
        else log_out();
    });

    var manager_details = manager_details_obj();
    $('#approve-manager-update').click(function(){
        alert('here');
        $('#manager-update-error').empty();
        var $msg_box = $('#manager-update-error');
        var empty_msg = is_empty_input();
        if(empty_msg.length > 0) $msg_box.html(empty_msg);
        else{
            if(!compare_manager_details(manager_details)) $msg_box.html('לא בוצעו שינויים');
            else update_manager_details_ajax(manager_details_obj(), $msg_box);
        }
    });

});

function authenticate_ajax($msg_box, $username, $password){
    var url = base_url + '/authenticate';
    var details = {
        username: $username,
        password: $password
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(details)}
    }).done(function(res){
        if(!res.status) $msg_box.html(res.msg);
        else window.location = '/';
    });
}

function update_manager_details(){
    window.location = '/manager-details';
}

function log_out(){
    window.location = base_url + '/authentication';
}

function manager_details_obj(){
    return {
        first_name: $('input').eq(0).val(),
        last_name: $('input').eq(1).val(),
        phone_number: $('input').eq(2).val(),
        email: $('input').eq(3).val(),
        username: $('input').eq(4).val(),
        password: $('input').eq(5).val()
    };
}

function compare_manager_details(prev){
    if(prev.first_name != $('input').eq(0).val()) return true;
    if(prev.last_name != $('input').eq(1).val()) return true;
    if(prev.phone_number != $('input').eq(2).val()) return true;
    if(prev.email != $('input').eq(3).val()) return true;
    if(prev.username != $('input').eq(4).val()) return true;
    if(prev.password != $('input').eq(5).val()) return true;
    return false;
}

function update_manager_details_ajax(manager, $msg_box){
    var url = base_url + '/update-manager-details';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(manager)}
    }).done(function(res){
        if(!res.status) $msg_box.html(res.msg);
        else update_manager_form(res, $msg_box);
    });
}

function update_manager_form(res, $msg_box){
    $('input').eq(0).val(res.result.first_name);
    $('input').eq(1).val(res.result.last_name);
    $('input').eq(2).val(res.result.phone_number);
    $('input').eq(3).val(res.result.email);
    $('input').eq(4).val(res.result.username);
    $('input').eq(5).val(res.result.password);
    $('.logged-cont p').html(res.result.username);
    $msg_box.html('הפרטים עודכנו בהצלחה');
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