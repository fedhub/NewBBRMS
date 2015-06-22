//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

var first_hour_mins = [], last_hour_mins = [], rest_hours_mins = [], hours = [];
var work_hours = {};
var now_open = false;
var order_time_changed = false;
var id;

$(document).ready(function() {

    $('.order-time-edit').css('display', 'none');

    $('.order-items').click(function(){
        var order_id = $(this).parent().attr('id');
        get_cart_details(order_id);
    });

    $('.close').click(function(){
        $('.lightbox').fadeOut();
    });

    $('.order-time').click(function(){
        var order_id = $(this).parent().attr('id');
        get_closing_time(order_id);
    });

    $(document).on('click', function (e) {
        if($(this).find('.order-time-edit:visible').length > 0){
            //var index = $(this).find('.order-time-edit:visible').index();
            var new_time = [];
            var old_time = $('.order-time-edit:visible').parent().find('p').text().split(':');
            new_time.push($('.order-time-edit:visible').find('.hours').val());
            new_time.push($('.order-time-edit:visible').find('.minutes').val());
            var order_id = $('.order-time-edit:visible').parent().parent().attr('id');
            //alert('new-time: ' + new_time + ' old-time: ' + old_time + ' order-id: ' + order_id);
            if((new_time[0] == old_time[0] && new_time[1] == old_time[1]) || !order_time_changed) $('.order-time-edit').css('display', 'none');
            else{
                order_time_changed = false;
                update_order_time(new_time, old_time, order_id);
            }
        }
    });

    $('.close-order').click(function(){
        var order_id = $(this).parent().attr('id');
        id = order_id;
        $('.lightbox').find('.title').find('p').html('סגירת הזמנה');
        $('.lightbox').find('.content').find('p').html('הלקוח קיבל את ההזמנה ואפשר לשחרר את ההזמנה מרשימת ההזמנות הממתינות?');
        $('.lightbox').fadeIn();
    });

    $('#approve').click(function(){
        var lightbox_type = ($(this).parent().find('.title').find('p').text());
        if(lightbox_type == 'סגירת הזמנה') close_order();
    });

    $('.hours').change(function() {
        hour_changed($(this), id);
    });

    $('.minutes').change(function() {
        order_time_changed = true;
    });

});

function close_order(){
    var url = base_url + '/close-pending-order&order_id='+id;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else window.location = base_url + '/manager-pending-orders';
    });
}

function get_cart_details(order_id){
    var url = base_url + '/get-cart-details&order_id='+order_id;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else prepare_cart_details(res.cart);
    });
}

function prepare_cart_details(cart){
    $('.lightbox').find('.title p').html('פרטי ההזמנה');
    $('.lightbox').find('.content p').html('');
    for(var i = 0; i < cart.length; i++){
        $('.lightbox').find('.content p').append(cart[i].name+': <br>');
        for(var j = 0; j < cart[i].addition_types.length; j++){
            $('.lightbox').find('.content p').append(cart[i].addition_types[j].name+': ');
            for(var k = 0; k < cart[i].addition_types[j].addition_items.length; k++){
                $('.lightbox').find('.content p').append(cart[i].addition_types[j].addition_items[k].name+'. ');
            }
        }
    }
    $('.lightbox').fadeIn();
}

function get_closing_time(order_id){
    var url = base_url + '/get-working-hours';
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else set_time_selection(res.working_time, order_id);
    });
}

function set_time_selection(working_time, order_id){
    var date = new Date();
    set_time_widget(working_time);
    time_options_creation('.hours', hours, order_id);
    if(hours.length == 1) time_options_creation('.minutes', get_curr_hour_mins(), order_id);
    // more then one hour open store left
    if(hours.length >= 2){
        if(date.getHours() == working_time.open_hour) time_options_creation('.minutes', first_hour_mins, order_id);
        else {
            if(now_open && date.getMinutes() <= 55) time_options_creation('.minutes', get_curr_hour_mins(), order_id);
            else if(now_open && date.getMinutes() > 55) time_options_creation('.minutes', rest_hours_mins, order_id);
            else time_options_creation('.minutes', first_hour_mins, order_id);
        }
    }
    id = order_id;
    $('#'+id).find('.order-time-edit').css('display', 'block').on('click', function(e) {
        e.stopPropagation();
    });
}

function time_options_creation(elm_id, time_arr, order_id){
    $('#'+order_id).find('.order-time-edit').find(elm_id).find('option').remove();
    for(var i = 0; i < time_arr.length; i++){
        var $option = $('<option>', {
            value: time_arr[i],
            text: time_arr[i]
        });
        $('#'+order_id).find('.order-time-edit').find(elm_id).append($option);
    }
}

function hour_changed(elm, order_id){
    var date = new Date();
    var hour = $(elm).val();
    parseInt(hour);
    if(hour == work_hours.open_hour) time_options_creation('.minutes', first_hour_mins, order_id);
    else if(hour == work_hours.close_hour){
        time_options_creation('.minutes', last_hour_mins, order_id);
        $('.minutes').val('00');
    }
    else{
        time_options_creation('.minutes', rest_hours_mins, order_id);
        $('.minutes').val('00');
    }
    if(hours.length >= 2 && date.getHours() == hour && date.getHours() != work_hours.open_hour && now_open){
        if(date.getMinutes() <= 55) time_options_creation('.minutes', get_curr_hour_mins(), order_id);
        else time_options_creation('.minutes', rest_hours_mins, order_id);
    }
    order_time_changed = true;
}

function update_order_time(new_time, old_time, order_id){
    var info = {
        new_hour: new_time[0],
        new_minutes: new_time[1],
        old_hour: old_time[0],
        old_minutes: old_time[1],
        order_id: order_id
    };
    var url = base_url + '/update-order-time';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else window.location = base_url + '/manager-pending-orders';
    });
}

function set_time_widget(working_time){
    var date = new Date();
    work_hours = working_time;
    var curr_hour = date.getHours();
    var curr_mins = date.getMinutes();
    // if we are out of the working time range
    if(curr_hour > working_time.close_hour || curr_hour < working_time.open_hour
        || (curr_hour == working_time.open_hour && curr_mins < working_time.open_minutes)
        || (curr_hour == working_time.close_hour && curr_mins > working_time.close_minutes)){
        if(working_time.close_minutes == 0) hours = get_hours(working_time.open_hour, (working_time.close_hour-1));
        if(working_time.close_minutes != 0) hours = get_hours(working_time.open_hour, working_time.close_hour);
        first_hour_mins = get_mins(working_time.open_minutes, 55);
        rest_hours_mins = get_mins(0, 55);
        last_hour_mins = get_mins(0, working_time.close_minutes);
    }
    // if we are within the working time range
    if((curr_hour < working_time.close_hour && curr_hour > working_time.open_hour)
        || (curr_hour == working_time.open_hour && curr_mins >= working_time.open_minutes)
        || (curr_hour == working_time.close_hour && curr_mins <= working_time.close_minutes)){
        if(working_time.close_minutes == 0) hours = get_hours(curr_hour, (working_time.close_hour-1));
        if(working_time.close_minutes != 0) hours = get_hours(curr_hour, working_time.close_hour);
        first_hour_mins = get_mins(round5(curr_mins), 55);
        rest_hours_mins = get_mins(0, 55);
        last_hour_mins = get_mins(0, working_time.close_minutes);
        if(curr_hour == working_time.close_hour && curr_mins <= working_time.close_minutes){
            last_hour_mins = get_mins(round5(curr_mins), working_time.close_minutes);
        }
        if(curr_mins > 55){
            if(working_time.close_minutes == 0) hours = get_hours((curr_hour + 1), (working_time.close_hour-1));
            if(working_time.close_minutes != 0) hours = get_hours((curr_hour + 1), working_time.close_hour);
            first_hour_mins = get_mins(0, 55);
            rest_hours_mins = get_mins(0, 55);
            last_hour_mins = get_mins(0, working_time.close_minutes);
        }
        now_open = true;
    }
}

function round5(x) {
    return Math.ceil(x/5)*5;
}

function add_zero_before(i) {
    if (i < 10) {i = "0" + i}  // add zero in front of numbers < 10
    return i;
}

function get_mins(starting_mins, ending_mins){
    var mins = [];
    for(var i = starting_mins; i <= ending_mins; i += 5){
        mins.push(add_zero_before(i));
    }
    return mins;
}

function get_hours(starting_hour, ending_hour){
    var hours = [];
    for(var i = starting_hour; i <= ending_hour; i++){
        hours.push(i);
    }
    return hours;
}

function get_curr_hour_mins(){
    var date = new Date();
    return get_mins(round5(date.getMinutes()), 55);
}