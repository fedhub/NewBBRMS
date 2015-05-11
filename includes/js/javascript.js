var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#user-icon').click(function(){
        $('#options-cont').fadeToggle(200);
    });

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
        if(id == 'update-manager-details') update_manager_details_ajax();
        else log_out_ajax();
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
        else{
            window.location = '/';
        }
    });
}

function update_manager_details_ajax(){
    alert('update');
}

function log_out_ajax(){
    window.location = base_url + '/authentication';
}