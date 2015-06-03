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

    $('#choose-item-stock-image').click(function(){
        $('#item-image-stock').trigger('click');
    });

    $('#submit-item-stock-image').click(function() {
        $('#stock-form').trigger('submit');
    });

    $("#item-image-stock").change(function() {

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

    $('#choose-item-related-image').click(function(){
        $('#item-image-related').trigger('click');
    });

    $('#submit-item-related-image').click(function() {
        $('#related-form').trigger('submit');
    });

    $("#item-image-related").change(function() {

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

function update_details_ajax(new_name, new_price, new_description){
    var url = base_url + '/update-menu-item-details';
    var id_params = $('.edit-menu-item-cont').attr('id').split('-');
    var params = {
        menu_type_id: id_params[0],
        menu_type_name: id_params[1],
        menu_item_id: id_params[2],
        menu_item_name: new_name,
        menu_item_price: new_price,
        menu_item_description: new_description
    };
    var info = {
        name: new_name,
        price: new_price,
        description: new_description,
        menu_item_id: id_params[2]
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-item&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function switch_image_ajax(image_id, type){
    var url = '';
    var params = get_params();
    var info = {
        new_image_id: image_id,
        old_image_id: $('#active-1').parent().attr('id').split('-')[2],
        menu_item_id: params.menu_item_id
    };
    if(type == 'related') url = base_url + '/switch-item-related-image-selected';
    if(type == 'all') url = base_url + '/switch-item-stock-image-selected';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-item&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function release_related_image_ajax(image_id){
    var url = base_url + '/release-item-related-image';
    var params = get_params();
    var info = {
        release_image_id: image_id,
        menu_item_id: params.menu_item_id
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-item&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function upload_image_ajax(form_data, type){
    var url = '';
    var params = get_params();
    var old_image_id = $('#active-1').parent().attr('id').split('-')[2];
    if(type == 'stock') url = base_url + '/upload-stock-image';
    if(type == 'related') url = base_url + '/upload-related-item-image&menu_item_id='+params.menu_item_id+'&old_image_id='+old_image_id;
    $.ajax({
        url: url,
        type: "POST",
        data: form_data,
        contentType: false,
        cache: false,
        processData:false
    }).done(function(res){
        if(res.status) window.location = base_url + '/edit-menu-item&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function get_params(){
    var id_params = $('.edit-menu-item-cont').attr('id').split('-');
    return {
        menu_type_id: id_params[0],
        menu_type_name: id_params[1],
        menu_item_id: id_params[2],
        menu_item_name: $('#name').val(),
        menu_item_price: $('#price').val(),
        menu_item_description: $('#description').val()
    };
}