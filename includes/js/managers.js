var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#managers').click(function(){
        check_if_admin_ajax();
    });

    $('#close-error-page').click(function(){
        $('#error-page').fadeOut(function(){
            location.reload();
        });
    });

});

function check_if_admin_ajax(){
    var url = base_url += '/is-admin-check';
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res) window.location = '/managers';
        else not_admin_handler();
    });
}

function not_admin_handler(){
    console.log('here');
    $('#error-msg').html('אין לך הרשאות משתמש מתאימות עבור ניהול המנהלים, הגישה נחסמה');
    $('#error-page').fadeIn();
}
