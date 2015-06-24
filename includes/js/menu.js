$(document).ready(function() {

    var $lightbox = $('<section>', {
        class: 'lightbox',
        id: 'lightbox'
    }).appendTo($('body'));
    var container = $('<section>',{
        class: 'container'
    }).appendTo($lightbox);
    var close = $('<section>',{
        class: 'close'
    }).append($('<p>', {class: 'flaticon-close32'})).appendTo(container);
    var title = $('<section>',{
        class: 'title'
    }).append($('<p>')).appendTo(container);
    var content = $('<section>',{
        class: 'content'
    }).append($('<p>')).appendTo(container);
    var approve = $('<section>', {
        class: "approve"
    }).append($('<p>', {text: 'אישור'})).appendTo(container);

    $('.menu-types-cont .item-container, .menu-items-cont .item-container, .additions-set-items .item-container').mouseenter(function(){
        $(this).find('.footer').toggleClass('top');
    });

    $('.menu-types-cont .item-container, .menu-items-cont .item-container, .additions-set-items .item-container').mouseleave(function(){
        $(this).find('.footer').toggleClass('top');
    });

    $('#lightbox').find('.close').click(function(){
        $('#lightbox').fadeOut();
    });

    // click events for conceal, edit, delete
    $('.menu-types-cont .item-container, .menu-items-cont .item-container, .additions-set-items .item-container').click(function(e){
        var id = e.target.id.split('-');
        var add_params = $(this).attr('id').split('-');
        // adding items handler
        // add-params="add-addition-item-<%= menu_type_id %>-<%= menu_type_name %>-<%= menu_item_id %>-<%= menu_item_name %>-<%= addition_types[i].id %>-<%= addition_types[i].name %>"
        if(add_params[0] == 'add'){
            if(add_params[1] == 'addition' && add_params[2] == 'item'){
                add_addition_item(add_params);
            }
            //add_params="add-menu-item-<%= menu_type_id %>-<%= menu_type_name %>"
            if(add_params[1] == 'menu' && add_params[2] == 'item'){
                window.location = base_url + '/add-menu-item-page&menu_type_id='+add_params[3]+'&menu_type_name='+add_params[4];
            }
            if(add_params[1] == 'menu' && add_params[2] == 'type'){
                window.location = base_url + '/add-menu-type-page';
            }
        }
        else if(id[0] == 'conceal' || id[0] == 'edit' || id[0] == 'delete'){
            var name = $(this).attr('name'); // name of the item
            var elm_id = $(this).attr('id').split('-');
            var allowed = true;
            if(id[0] == 'conceal'){
                var concealed = $(this).find('.sealed-cont').attr('id');
                if(concealed == '1'){
                    alert('"'+name+'"' + ' כבר מוסתר');
                    allowed = false;
                }
            }
            if(allowed) handle_item_option_req($lightbox, name, id, elm_id); // sets the lightbox approve button id for conceal and delete and handles edit requests
        }
        else{
            var class_name = $(this).parent().attr('class');
            var menu_type_id, menu_type_name, menu_item_id, menu_item_name;
            if(class_name == 'menu-types-cont'){
                menu_type_id = $(this).attr('id').split('-')[2];
                menu_type_name = $(this).find('.header p').text();
            }
            if (class_name == 'menu-items-cont') {
                var query_arr = $(this).attr('id').split('-');
                menu_type_id = query_arr[1];
                menu_type_name = query_arr[0];
                menu_item_id = query_arr[3];
                menu_item_name = query_arr[2];
            }
            if(id[0] != 'reveal') {
                if (class_name == 'menu-types-cont') {
                    window.location = '/menu-items&menu_type_id=' + menu_type_id + '&menu_type_name=' + menu_type_name;
                }
                if (class_name == 'menu-items-cont') {
                    window.location = '/menu-additions&menu_type_id=' + menu_type_id + '&menu_type_name=' + menu_type_name + '&menu_item_id=' + menu_item_id + '&menu_item_name=' + menu_item_name;
                }
            }
            else{
                if(id[1] == 'menutype') reveal_menutype_ajax(menu_type_id);
                if(id[1] == 'menuitem') reveal_menuitem_ajax(menu_type_id, menu_item_id);
                if(id[1] == 'additionitem'){
                    var elm_id = $(this).attr('id').split('-');
                    reveal_additionitem_ajax(elm_id[0], elm_id[1], elm_id[2], elm_id[3]);
                }
            }
        }
    });

    // lightbox conceal and delete approvals events
    $('body #lightbox .approve').click(function(){
        var id = $(this).attr('id');
        handle_item_option_approval(id);
    });

});

function handle_item_option_req($lightbox, name, id, elm_id){
    var msg = '';
    var title = '';
    var menu_type_id, menu_item_id, addition_type_id, addition_item_id;
    if(id[0] == 'conceal'){
        title = 'הסתרת ';
        title += '"' + name + '"' + ' ';
        title += 'באפליקצייה';
        msg = '"' + name + '"' + ' ';
        msg += 'לא יוצג ללקוח באפליקצייה, באפשרותך לבטל את ההסתרה בעתיד, האם להמשיך?';
        if(id[1] == 'menutype'){
            menu_type_id = elm_id[2];
            $lightbox.find('.approve').attr('id', 'conceal-menutype-'+menu_type_id);
        }
        if(id[1] == 'menuitem'){
            menu_type_id = elm_id[1];
            menu_item_id = elm_id[3];
            $lightbox.find('.approve').attr('id', 'conceal-menuitem-'+menu_type_id+'-'+menu_item_id);
        }
        if(id[1] == 'additionitem'){
            menu_type_id = elm_id[0];
            menu_item_id = elm_id[1];
            addition_type_id = elm_id[2];
            addition_item_id = elm_id[3];
            $lightbox.find('.approve').attr('id', 'conceal-additionitem-'+menu_type_id+'-'+menu_item_id+'-'+addition_type_id+'-'+addition_item_id);
        }
    }

    if(id[0] == 'delete'){
        title = 'מחיקת ';
        title += '"' + name + '"' + ' ';
        title += 'מהאפליקצייה';
        msg += 'האם אתה בטוח שברצונך למחוק את ';
        msg += '"' + name + '"' + ' ' + 'מהתפריט?';
        if(id[1] == 'menutype'){
            msg += 'המחיקה תגרור מחיקת הפריטים המשוייכים לפריט זה, אך לא את התוספות, האם להמשיך?';
            menu_type_id = elm_id[2];
            $lightbox.find('.approve').attr('id', 'delete-menutype-'+menu_type_id);
        }
        if(id[1] == 'menuitem'){
            menu_type_id = elm_id[1];
            menu_item_id = elm_id[3];
            $lightbox.find('.approve').attr('id', 'delete-menuitem-'+menu_type_id+'-'+menu_item_id);
        }
        if(id[1] == 'additionitem'){
            menu_type_id = elm_id[0];
            menu_item_id = elm_id[1];
            addition_type_id = elm_id[2];
            addition_item_id = elm_id[3];
            $lightbox.find('.approve').attr('id', 'delete-additionitem-'+menu_type_id+'-'+menu_item_id+'-'+addition_type_id+'-'+addition_item_id);
        }
    }

    if(id[0] == 'edit'){
        var params;
        if(id[1] == 'menutype'){
            params = {
                menu_type_id: id[2],
                menu_type_name: id[3]
            };
            window.location = base_url + '/edit-menu-type&params='+encodeURIComponent(JSON.stringify(params));
        }
        if(id[1] == 'menuitem'){
            params = {
                menu_type_name: id[2],
                menu_type_id: id[3],
                menu_item_name: id[4],
                menu_item_id: id[5],
                menu_item_price: id[6],
                menu_item_description: $('.menu-items-cont').find('#desc-'+id[5]).find('p').text()
            };
            window.location = base_url + '/edit-menu-item&params='+encodeURIComponent(JSON.stringify(params));
        }
        if(id[1] == 'additionitem'){
            params = {
                menu_type_id: id[2],
                menu_type_name: id[3],
                menu_item_id: id[4],
                menu_item_name: id[5],
                addition_item_name: id[6],
                addition_item_id: id[7],
                addition_item_price: id[8],
                addition_item_description: $('.menu-additions-cont').find('#desc-'+id[7]).find('p').text()
            };
            window.location = base_url + '/edit-addition-item&params='+encodeURIComponent(JSON.stringify(params));
        }
    }
    if(id[0] != 'edit') {
        $lightbox.find('.title p').html(title);
        $lightbox.find('.content p').html(msg);
        $lightbox.fadeIn();
    }
}

function handle_item_option_approval(id){
    var id_params = id.split('-');
    var menu_type_id, menu_item_id, addition_type_id, addition_item_id;
    if(id_params[0] == 'conceal'){
        if(id_params[1] == 'menutype'){
            conceal_menutype_ajax(id_params);
        }
        if(id_params[1] == 'menuitem'){
            conceal_menuitem_ajax(id_params);
        }
        if(id_params[1] == 'additionitem'){
            conceal_additionitem_ajax(id_params);
        }
    }
    if(id_params[0] == 'delete'){
        if(id_params[1] == 'menutype'){
            delete_menutype_ajax(id_params);
        }
        if(id_params[1] == 'menuitem'){
            delete_menuitem_ajax(id_params);
        }
        if(id_params[1] == 'additionitem'){
            delete_additionitem_ajax(id_params);
        }
    }
}

//id_params:  ['conceal', 'menutype', '+menu_type_id+']
function conceal_menutype_ajax(id_params){
    var url = base_url + '/conceal-menu-type&menu_type_id=' + id_params[2];
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-types';
        else alert(res.msg);
    });
}

// id_params: ['conceal', 'menuitem', '+menu_type_id+', '+menu_item_id+'];
function conceal_menuitem_ajax(id_params){
    var url = base_url + '/conceal-menu-item&menu_type_id='+id_params[2]+'&menu_item_id=' + id_params[3];
    var menu_type_id = id_params[2];
    var menu_type_name = $('.menu-items-cont .item-container').attr('id').split('-')[0];
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name;
        else alert(res.msg);
    });
}


// id_params: ['conceal', 'additionitem', '+menu_type_id+', '+menu_item_id+', '+addition_type_id+', '+addition_item_id+'];
function conceal_additionitem_ajax(id_params){
    var url = base_url + '/conceal-addition-item&addition_type_id=' + id_params[4]+'&addition_item_id=' + id_params[5];
    var menu_type_name = $('body .breadcrumbs-strip .breadcrumb-item a').eq(2).text();
    var menu_item_name = $('body .breadcrumbs-strip .breadcrumb-item a').eq(3).text();
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-additions&menu_type_id='+id_params[2]+'&menu_type_name='+menu_type_name+'&menu_item_id='+id_params[3]+'&menu_item_name='+menu_item_name;
        else alert(res.msg);
    });
}

//id_params: ['delete', 'menutype', '+menu_type_id+']
function delete_menutype_ajax(id_params){
    var url = base_url + '/delete-menu-type&menu_type_id=' + id_params[2];
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-types';
        else alert(res.msg);
    });
}

// id_params: ['delete', 'menuitem', '+menu_type_id+', '+menu_item_id+'];
function delete_menuitem_ajax(id_params){
    var url = base_url + '/delete-menu-item&menu_type_id='+id_params[2]+'&menu_item_id=' + id_params[3];
    var menu_type_id = id_params[2];
    var menu_type_name = $('.menu-items-cont .item-container').attr('id').split('-')[0];
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name;
        else alert(res.msg);
    });
}

// id_params: ['delete', 'additionitem', '+menu_type_id+', '+menu_item_id+', '+addition_type_id+', '+addition_item_id+'];
function delete_additionitem_ajax(id_params){
    var url = base_url + '/delete-addition-item&addition_type_id=' + id_params[4]+'&addition_item_id=' + id_params[5];
    var menu_type_name = $('body .breadcrumbs-strip .breadcrumb-item a').eq(2).text();
    var menu_item_name = $('body .breadcrumbs-strip .breadcrumb-item a').eq(3).text();
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-additions&menu_type_id='+id_params[2]+'&menu_type_name='+menu_type_name+'&menu_item_id='+id_params[3]+'&menu_item_name='+menu_item_name;
        else alert(res.msg);
    });
}

function reveal_menutype_ajax(menu_type_id){
    var url = base_url + '/reveal-menu-type&menu_type_id=' + menu_type_id;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-types';
        else alert(res.msg);
    });
}

function reveal_menuitem_ajax(menu_type_id, menu_item_id){
    var url = base_url + '/reveal-menu-item&menu_type_id='+menu_type_id+'&menu_item_id=' + menu_item_id;
    var menu_type_name = $('.menu-items-cont .item-container').attr('id').split('-')[0];
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name;
        else alert(res.msg);
    });
}

function reveal_additionitem_ajax(menu_type_id, menu_item_id, addition_type_id, addition_item_id){
    var url = base_url + '/reveal-addition-item&addition_type_id=' + addition_type_id+'&addition_item_id=' + addition_item_id;
    var menu_type_name = $('body .breadcrumbs-strip .breadcrumb-item a').eq(2).text();
    var menu_item_name = $('body .breadcrumbs-strip .breadcrumb-item a').eq(3).text();
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status) window.location = base_url + '/menu-additions&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name+'&menu_item_id='+menu_item_id+'&menu_item_name='+menu_item_name;
        else alert(res.msg);
    });
}

// add-params="add-addition-item-<%= menu_type_id %>-<%= menu_type_name %>-<%= menu_item_id %>-<%= menu_item_name %>-<%= addition_types[i].id %>-<%= addition_types[i].name %>"
function add_addition_item(add_params){
    var params = {
        menu_type_id: add_params[3],
        menu_type_name: add_params[4],
        menu_item_id: add_params[5],
        menu_item_name: add_params[6],
        addition_type_id: add_params[7],
        addition_type_name: add_params[8]
    };
    window.location = base_url + '/add-addition-item&params='+encodeURIComponent(JSON.stringify(params));
}