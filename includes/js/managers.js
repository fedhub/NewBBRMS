var base_url = 'http://localhost:3000';

$(document).ready(function() {

    var $msg_box = $('<div>', {
        class: 'msg'
    }).append($('<p>'));

    $('#managers').click(function(){
        check_if_admin_ajax();
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
        else window.location = '/update-admin&manager_id='+manager_id+'&admin_state='+new_admin_state;
    });

    $('.delete').click(function(e){
        var index = $(this).parent().index()-1; // the row index
        var id = $(e.target).attr('id');
        var manager_id = id.split('-')[1]; // the manager id in the database
        get_manager_id_ajax($msg_box, index, manager_id);
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

function get_manager_id_ajax($msg_box, index, manager_id){
    var url = base_url + '/manager-id&test_id=' + manager_id;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res) {  // can't delete himself
            console.log('here');
            $msg_box.find('p').html('אינך רשאי למחוק את עצמך');
            elm.eq(index).append($msg_box);
            $msg_box.fadeIn().delay(500).fadeOut(function(){
                $msg_box.remove();
            });
        }
        else window.location = '/delete-manager&manager_id='+manager_id;
    });
}