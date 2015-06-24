var backup_id, old_name, old_description, new_name, new_description;
$(document).ready(function() {

    $('#create-backup').click(function(){
        $('#button-text').html('מגבה...');
        $('.icon p').removeClass('flaticon-database');
        $('.icon').css('background', 'url("../images/gifs/ajax-loader.gif") no-repeat center center');
        create_backup();
    });

    $('.name, .description').click(function(e){
        backup_id = $(this).parent().attr('id');
        old_name = $(this).parent().find('.name input').val();
        old_description = $(this).parent().find('.description input').val();
        $('input').css('display', 'none');
        $(this).find('input').css('display', 'block');

    });

    $('input, .name,  .description').click(function(e){
        e.stopPropagation();
    });

    $(document).on('click', function (e) {
        if(e.target.className != "name" && e.target.className != "description" && $(this).find('input:visible').length > 0){
            new_name = $(this).find('#'+backup_id).find('.name input').val();
            new_description = $(this).find('#'+backup_id).find('.description input').val();
            if(new_name == old_name && new_description == old_description) $('input').css('display', 'none');
            else update_backup_details();
        }
    });

    $('.download').click(function(){
        if($(this).parent().index() > 0){
            backup_id = $(this).parent().attr('id');
            var file_name = $('#'+backup_id).find('.file-name').text();
            window.location = base_url + '/download-backup-file&file_name='+file_name;
        }
    });

    $('.delete').click(function(){
        if($(this).parent().index() > 0){
            backup_id = $(this).parent().attr('id');
            var file_name = $('#'+backup_id).find('.file-name').text();
            delete_backup(file_name);
        }
    });

});

function create_backup(){
    var url = base_url + '/create-backup';
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else window.location = base_url + '/backup';
    });
}

function update_backup_details(){
    var url = base_url + '/update-backup-details';
    var info = {
        backup_id: backup_id,
        new_name: new_name,
        new_description: new_description
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else window.location = base_url + '/backup';
    });
}

function delete_backup(file_name){
    var url = base_url + '/delete-backup';
    var info = {
        backup_id: backup_id,
        file_name: file_name
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else window.location = base_url + '/backup';
    });
}