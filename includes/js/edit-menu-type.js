//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#active-1').toggle();

    var name = $('#name').val();

    $('#save-details').click(function(){
        var id = $(this).parent().parent().parent().attr('id');
        var new_name = $('#name').val();
        var msg = '';
        if(new_name.length == 0) msg += 'הזן שם פריט. ';
        if(name == new_name) msg += 'לא בוצעו שינויים';
        if(msg.length > 0) alert(msg);
        else update_details_ajax(new_name);
    });

    $('.related-image-cont').click(function(event){
        var class_name = $(event.target).parent().attr('class');
        var image_id = $(this).attr('id').split('-')[2];
        if(class_name != 'remove') {
            if ($(this).find('.active').attr('id') == 'active-1') alert('התמונה כבר פעילה עבור הפריט');
            else switch_image_ajax(image_id, 'related');
        }
        else{
            if($(this).find('.active').attr('id') == 'active-1') alert('לא אפשרי לבטל שיוך של תמונה פעילה');
            else release_related_image_ajax(image_id);
        }
    });

    $('.all-image-cont').click(function(){
        var image_id = $(this).attr('id').split('-')[2];
        switch_image_ajax(image_id, 'all');
    });

    $('.related-image-cont').mouseenter(function(){
        $(this).find('.remove').toggle();
    });

    $('.related-image-cont').mouseleave(function(){
        $(this).find('.remove').toggle();
    });

    $('#choose-type-stock-image').click(function(){
        $('#type-image-stock').trigger('click');
    });

    $('#submit-type-stock-image').click(function() {
        $('#stock-form').trigger('submit');
    });

    $("#type-image-stock").change(function() {

        var file = this.files[0];
        var type = file.type;
        var size = file.size;
        var name = file.name;
        $('#stock-image-name p').html(name);

        var msg = '';
        if(name.length < 1){
            msg = 'לא ניתן להעלות תמונה ללא שם';
            alert(msg);
        }
        else if(size > 100000){
            msg = 'נפח התמונה גדול מדי, עד 100KB מותר';
            alert(msg);
        }
        else if(type != 'image/png' && type != 'image/jpg' && type != 'image/gif' && type != 'image/jpeg' ){
            msg = 'רק סיומות gif jpeg jpg png מותרות';
            alert(msg);
        }
        else{
            $("#stock-form").on('submit',(function(e) {
                if(msg.length == 0){
                    e.preventDefault();
                    upload_image_ajax(new FormData(this), 'stock');
                }
            }));
        }
    });

    $('#choose-type-related-image').click(function(){
        $('#type-image-related').trigger('click');
    });

    $('#submit-type-related-image').click(function() {
        $('#related-form').trigger('submit');
    });

    $("#type-image-related").change(function() {

        var file = this.files[0];
        var type = file.type;
        var size = file.size;
        var name = file.name;
        $('#related-image-name p').html(name);

        var msg = '';
        if(name.length < 1){
            msg = 'לא ניתן להעלות תמונה ללא שם';
            alert(msg);
        }
        else if(size > 100000){
            msg = 'נפח התמונה גדול מדי, עד 100KB מותר';
            alert(msg);
        }
        else if(type != 'image/png' && type != 'image/jpg' && type != 'image/gif' && type != 'image/jpeg' ){
            msg = 'רק סיומות gif jpeg jpg png מותרות';
            alert(msg);
        }
        else{
            $("#related-form").on('submit',(function(e) {
                if(msg.length == 0){
                    e.preventDefault();
                    upload_image_ajax(new FormData(this), 'related');
                }
            }));
        }
    });

});

function update_details_ajax(new_name){
    var url = base_url + '/update-menu-type-details';
    var id_params = $('.edit-menu-type-cont').attr('id').split('-');
    var params = {
        menu_type_id: id_params[0],
        menu_type_name: new_name
    };
    var info = {
        name: new_name,
        menu_type_id: id_params[0]
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-type&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function switch_image_ajax(image_id, type){
    var url = '';
    var params = get_params();
    var info = {
        new_image_id: image_id,
        old_image_id: $('#active-1').parent().attr('id').split('-')[2],
        menu_type_id: params.menu_type_id
    };
    if(type == 'related') url = base_url + '/switch-type-related-image-selected';
    if(type == 'all') url = base_url + '/switch-type-stock-image-selected';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-type&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function release_related_image_ajax(image_id){
    var url = base_url + '/release-type-related-image';
    var params = get_params();
    var info = {
        release_image_id: image_id,
        menu_type_id: params.menu_type_id
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-type&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function upload_image_ajax(form_data, type){
    var url = '';
    var params = get_params();
    var old_image_id = $('#active-1').parent().attr('id').split('-')[2];
    if(type == 'stock') url = base_url + '/upload-stock-image';
    if(type == 'related') url = base_url + '/upload-related-type-image&menu_type_id='+params.menu_type_id+'&old_image_id='+old_image_id;
    $.ajax({
        url: url,
        type: "POST",
        data: form_data,
        contentType: false,
        cache: false,
        processData:false
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-type&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function get_params(){
    var id_params = $('.edit-menu-type-cont').attr('id').split('-');
    return {
        menu_type_id: id_params[0],
        menu_type_name: $('#name').val(),
    };
}