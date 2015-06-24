// globals
var name, price, description, image_id;
$(document).ready(function() {

    $('#step-2').css('opacity', '0.6');

    $('#forward').click(function(){
        var input_err = input_checks();
        if(input_err.length > 0) alert(input_err);
        else{
            $('#step-2').fadeTo('slow','1');
            $('#step-1').fadeTo('slow','0.6');
            $('.form-container').fadeOut(function(){
                $('.all-images').fadeIn();
            });
            step_two_resize();
        }
    });

    $('#backward').click(function(){
        $('#step-2').fadeTo('slow','0.6');
        $('#step-1').fadeTo('slow','1');
        $('.all-images').fadeOut(function(){
            $('.form-container').fadeIn();
        });
        step_one_resize();
    });

    $('.all-image-cont').click(function(event){
        image_id = event.target.id.split('-')[2];
        create_item_ajax(image_id);
    });

    $('#choose-addition-stock-image').click(function(){
        $('#addition-image-stock').trigger('click');
    });

    $('#submit-addition-stock-image').click(function() {
        $('#stock-form').trigger('submit');
    });

    $("#addition-image-stock").change(function() {

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
                    upload_image_ajax(new FormData(this));
                }
            }));
        }
    });

});

function input_checks(){
    name = $('#name').val();
    price = $('#price').val();
    description = $('#description').val();
    var msg = '';
    if(name.length == 0) msg += 'אנא הזן שם לפריט. ';
    if(price.length == 0) msg += 'אנא הזן מחיר לפריט. ';
    if(!(/^\d+$/.test(price))) msg += 'מחיר צריך להכיל רק ספרות. ';
    return msg;
}

function step_two_resize(){
    var $header_height = $('header').height();
    var $footer_height = $('footer').height();
    var $steps_container_height = $('.steps-container').height();
    var $all_images_height = $('.all-images').height();
    $('.main').height($all_images_height + $steps_container_height + 200);
    $('body, html').height($header_height + $('.main').height() + $footer_height);
}

function step_one_resize(){
    var $header_height = $('header').height();
    var $footer_height = $('footer').height();
    $('.main').height($(window).height() - $header_height - $footer_height);
    $('body, html').height($header_height + $('.main').height() + $footer_height);
}

// id="<%= params.menu_type_id %>-<%= params.menu_type_name %>-<%= params.menu_item_id %>-<%= params.menu_item_name %>-<%= params.addition_type_id %>-<%= params.addition_type_name %>"
function create_item_ajax(image_id){
    var url = base_url + '/create-addition-item';
    var params = get_params();
    var info = {
        image_id: image_id,
        addition_type_id: params.addition_type_id,
        name: name,
        price: price,
        description: description
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res.status) window.location = base_url + '/add-addition-item&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

function upload_image_ajax(form_data){
    var params = get_params();
    var info = {
        addition_type_id: params.addition_type_id,
        name: name,
        price: price,
        description: description
    };
    var url = '/create-addition-item-with-image-upload&params=' + encodeURIComponent(JSON.stringify(info));
    $.ajax({
        url: url,
        type: "POST",
        data: form_data,
        contentType: false,
        cache: false,
        processData:false
    }).done(function(res){
        if(res.status) window.location = base_url + '/add-addition-item&params=' + encodeURIComponent(JSON.stringify(params));
        else alert(res.msg);
    });
}

// id="<%= params.menu_type_id %>-<%= params.menu_type_name %>-<%= params.menu_item_id %>-<%= params.menu_item_name %>-<%= params.addition_type_id %>-<%= params.addition_type_name %>"
function get_params(){
    var id_params = $('.add-addition-item-cont').attr('id').split('-');
     return {
        menu_type_id: id_params[0],
        menu_type_name: id_params[1],
        menu_item_id: id_params[2],
        menu_item_name: id_params[3],
        addition_type_id: id_params[4],
        addition_type_name: id_params[5]
    };
}