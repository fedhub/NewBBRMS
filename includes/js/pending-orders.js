var socket = io.connect(base_url,{
    'reconnect': true,
    'reconnection delay': 2000,
    'max reconnection attempts': 10
});

var first_hour_mins = [], last_hour_mins = [], rest_hours_mins = [], hours = [];
var work_hours = {};
var now_open = false;
var order_time_changed = false;
var order_id, $order_cont;
var index;

$(document).ready(function() {

    socket.on('real-time-order', function(data){
        real_time_order_handler(data);
    });

    normalize_height();
    set_status();

    $('#close-window').click(function(){
        window.history.back();
    });

    $('.button').click(function(){
        button_handler(this);
    });

    $('.status-item').click(function(){
        status_handler($(this));
    });

    $('#close').click(function(){
        $('#lightbox').fadeOut();
    });
    $('#approve').click(function(){
        close_order_ajax(order_id, $order_cont);
    });

    $('.order-cont').each(function(index) {
        $(this).find('#order-time').click(function(){get_closing_time(index);});
        $(this).toggle();
        //$(this).delay(1000*index).fadeIn(1000);
    });

    $(document).on('click', function (e) {
        if($(this).find('.order-time-edit:visible').length > 0){
            //var index = $(this).find('.order-time-edit:visible').index();
            var new_time = [];
            var old_time = $('.order-time-edit:visible').parent().find('p').text().split(':');
            new_time.push($('.order-time-edit:visible').find('.hours').val());
            new_time.push($('.order-time-edit:visible').find('.minutes').val());
            var order_id = $('.order-time-edit:visible').parent().parent().parent().find('.button').attr('id').split('-')[2];
            //alert('new-time: ' + new_time + ' old-time: ' + old_time);
            if((new_time[0] == old_time[0] && new_time[1] == old_time[1]) || !order_time_changed) $('.order-time-edit').css('display', 'none');
            else{
                order_time_changed = false;
                update_order_time(new_time, old_time, order_id);
            }
        }
    });

    $('.hours').change(function() {
        hour_changed($(this), index);
    });
    $('.minutes').change(function() {
        order_time_changed = true;
    });

});

function hour_changed(elm, index){
    var date = new Date();
    var hour = $(elm).val();
    parseInt(hour);
    if(hour == work_hours.open_hour) time_options_creation('.minutes', first_hour_mins, index);
    else if(hour == work_hours.close_hour){
        time_options_creation('.minutes', last_hour_mins, index);
        $('.minutes').val('00');
    }
    else{
        time_options_creation('.minutes', rest_hours_mins, index);
        $('.minutes').val('00');
    }
    if(hours.length >= 2 && date.getHours() == hour && date.getHours() != work_hours.open_hour && now_open){
        if(date.getMinutes() <= 55) time_options_creation('.minutes', get_curr_hour_mins(), index);
        else time_options_creation('.minutes', rest_hours_mins, index);
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
        else window.location = base_url + '/pending-orders';
    });
}

function get_closing_time(order_cont_index){
    var url = base_url + '/get-working-hours';
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else set_time_selection(res.working_time, order_cont_index);
    });
}

function set_time_selection(working_time, order_cont_index){
    var date = new Date();
    set_time_widget(working_time);
    time_options_creation('.hours', hours, order_cont_index);
    if(hours.length == 1) time_options_creation('.minutes', get_curr_hour_mins(), order_cont_index);
    // more then one hour open store left
    if(hours.length >= 2){
        if(date.getHours() == working_time.open_hour) time_options_creation('.minutes', first_hour_mins, order_cont_index);
        else {
            if(now_open && date.getMinutes() <= 55) time_options_creation('.minutes', get_curr_hour_mins(), order_cont_index);
            else if(now_open && date.getMinutes() > 55) time_options_creation('.minutes', rest_hours_mins, order_cont_index);
            else time_options_creation('.minutes', first_hour_mins, order_cont_index);
        }
    }
    index = order_cont_index;
    $('.order-time-edit').eq(order_cont_index).css('display', 'block').on('click', function(e) {
        e.stopPropagation();
    });
}

function time_options_creation(elm_id, time_arr, order_cont_index){
    $('.order-time-edit').eq(order_cont_index).find(elm_id).find('option').remove();
    for(var i = 0; i < time_arr.length; i++){
        var $option = $('<option>', {
            value: time_arr[i],
            text: time_arr[i]
        });
        $('.order-time-edit').eq(order_cont_index).find(elm_id).append($option);
    }
}

function status_handler($status){
    //var status_level = $status.parent().attr('id');
    if(! $status.hasClass('background-after')){
        var status_req = $status.attr('id').split('-')[1];
        var order_id = $($status).parent().parent().find('.button').attr('id').split('-')[2];
        //var phone_number = $($status).parent().attr('name');
        var phone_number = $($status).parent().parent().parent().find('.info').eq(2).text();
        var url = base_url + '/update-order-status&new_status='+status_req+'&order_id='+order_id+'&phone_number='+phone_number;
        $.ajax({
            url: url,
            type: 'POST'
        }).done(function(res){
            if(res.status) {
                var elm = $($status).parent().find('.status-item');
                for(var i = 0; i < status_req; i++){
                    if(! $(elm).eq(i).hasClass('background-after')){
                        $(elm).eq(i).removeClass('background-before').addClass('background-after');
                    }
                }
                $($status).removeClass('background-before').addClass('background-after');
            }
            else alert(res.msg);
        });
    }
}

function set_status(){
    $('.order-cont').each(function(){
        var $status_cont = $(this).find('.status-cont');
        var status_level = $status_cont.attr('id');
        var $status_items = $status_cont.find('.status-item');
        for(var i = 0; i < status_level; i++){
            $status_items.eq(i).removeClass('background-before').addClass('background-after');
        }
    });
}

function normalize_height(){
    $('.order-cont').height($('body').height() - 100);
    $('.cart-cont').height($('.order-cont').height() - $('footer').height() - $('.order-details-cont').height() - $('.customer-details-cont').height() - 45);
}

function close_order_message(){
    $('#lightbox .content p').html('הלקוח קיבל את ההזמנה ואפשר לסגור את החלון?');
    $('#lightbox').fadeIn();
}

function close_order_ajax(order_id, $order_cont){
    var url = base_url + '/close-pending-order&order_id=' + order_id;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res.status){
            $('#lightbox').toggle();
            var order_dets = get_order_dets($order_cont);
            update_statistics(order_dets, -1);
            $order_cont.fadeOut(function(){$(this).remove()});
        }
        else alert(res.msg);
    });
}

function get_order_dets($order_cont){
    var dets = {
        customer_type: $order_cont.find('#customer-type').text(),
        order_type: $order_cont.find('#order-type').text(),
        payment_method: $order_cont.find('#payment-method').text()
    };
    if(dets.customer_type == 'עסקי') dets.customer_type = 'business';
    if(dets.customer_type == 'פרטי') dets.customer_type = 'private';
    if(dets.order_type == 'משלוח') dets.order_type = 'delivery';
    if(dets.order_type == 'לקחת') dets.order_type = 'take-away';
    if(dets.order_type == 'לשבת') dets.order_type = 'sit';
    if(dets.payment_method == 'מזומן') dets.payment_method = 'cash';
    if(dets.payment_method == 'אשראי') dets.payment_method = 'credit';
    return dets;
}

function button_handler(elm){
    var id = $(elm).attr('id').split('-');
    order_id = id[2];
    $order_cont = $(elm).parent().parent().parent();
    if(id[0] == 'close') close_order_message();
}

function real_time_order_handler(data){
    var html = get_order_cont_elm(data);
    var serial_number = data.serial_number;
    var order_hour = data.order.order_hour;
    var order_minutes = data.order.order_minutes;
    var orders_count = $('.order-cont').length;
    if(serial_number == 1 || (serial_number > 1 && orders_count == 0)){
        $('.pending-orders-cont').append($(html).fadeIn());
        normalize_height();
        $('.order-cont').eq(0).find('.button').click(function(){button_handler(this)});
        $('.order-cont').eq(0).find('.status-item').click(function(){status_handler($(this))});
        $('.order-cont').eq(0).find('#order-time').click(function(){get_closing_time(0)});
        $('.order-cont').eq(0).find('.hours').change(function(){hour_changed($(this), 0)});
        $('.order-cont').eq(0).find('.minutes').change(function(){order_time_changed = true;});
        set_status_text($('.order-cont').eq(0).find('.status-item'), data.order.order_type);
        set_dynamic_status($('.order-cont').eq(0));
    }
    if(serial_number > 1){
        console.log('here');
        $('.order-cont').each(function(i){
            var time_str = $(this).find('#order-time p').text().split(':');
            var time_params = {hour: parseInt(time_str[0]), minutes: parseInt(time_str[1])};
            if(order_hour == time_params.hour || order_hour > time_params.hour){
                if(order_minutes < time_params.minutes && order_hour == time_params.hour){
                    $($(this)).before($(html).fadeIn());
                    normalize_height();
                    $('.order-cont').eq(i).find('.button').click(function(){button_handler(this)});
                    $('.order-cont').eq(i).find('.status-item').click(function(){status_handler($(this))});
                    $('.order-cont').eq(i).find('#order-time').click(function(){get_closing_time(i)});
                    $('.order-cont').eq(i).find('.hours').change(function(){hour_changed($(this), i)});
                    $('.order-cont').eq(i).find('.minutes').change(function(){order_time_changed = true;});
                    set_status_text($('.order-cont').eq(i).find('.status-item'), data.order.order_type);
                    set_dynamic_status($('.order-cont').eq(i));
                    return false;
                }
                if(i == orders_count - 1){
                    $('.pending-orders-cont').append($(html).fadeIn());
                    normalize_height();
                    $('.order-cont').eq(orders_count).find('.button').click(function(){button_handler(this)});
                    $('.order-cont').eq(orders_count).find('.status-item').click(function(){status_handler($(this))});
                    $('.order-cont').eq(orders_count).find('#order-time').click(function(){get_closing_time(orders_count)});
                    $('.order-cont').eq(orders_count).find('.hours').change(function(){hour_changed($(this), orders_count)});
                    $('.order-cont').eq(orders_count).find('.minutes').change(function(){order_time_changed = true;});
                    set_status_text($('.order-cont').eq(orders_count).find('.status-item'), data.order.order_type);
                    set_dynamic_status($('.order-cont').eq(orders_count));
                }
            }
            if(order_hour < time_params.hour){
                $($(this)).before($(html).fadeIn());
                normalize_height();
                $('.order-cont').eq(i).find('.button').click(function(){button_handler(this)});
                $('.order-cont').eq(i).find('.status-item').click(function(){status_handler($(this))});
                $('.order-cont').eq(i).find('#order-time').click(function(){get_closing_time(i)});
                $('.order-cont').eq(i).find('.hours').change(function(){hour_changed($(this), i)});
                $('.order-cont').eq(i).find('.minutes').change(function(){order_time_changed = true;});
                set_status_text($('.order-cont').eq(i).find('.status-item'), data.order.order_type);
                set_dynamic_status($('.order-cont').eq(i));
                return false;
            }
        });
    }
}

function set_status_text($status_items, order_type){
    if(order_type == 'משלוח'){
        $($status_items).eq(2).find('p').html('אריזה');
        $($status_items).eq(3).find('p').html('בדרך אליך!');
    }
    if(order_type == 'לשבת'){
        $($status_items).eq(2).find('p').html('בצלחת');
        $($status_items).eq(3).find('p').html('מחכה לך!');
    }
    if(order_type == 'לקחת'){
        $($status_items).eq(2).find('p').html('אריזה');
        $($status_items).eq(3).find('p').html('מחכה לך!');
    }
}

function set_dynamic_status($order_cont){
    var $status_cont = $order_cont.find('.status-cont');
    var status_level = $status_cont.attr('id');
    var $status_items = $status_cont.find('.status-item');
    for(var i = 0; i < status_level; i++){
        $status_items.eq(i).removeClass('background-before').addClass('background-after');
    }
}

function update_statistics(order_details, val){
    if(order_details.customer_type == 'business'){
        order_details.customer_type = 'עסקי';
        var business_stat = $('.stat-cont').eq(0).text().split(':');
        var business_count = parseInt(business_stat[1]);
        $('.stat-cont:eq(0) p').html(business_stat[0]+':'+' '+(business_count + val));
    }

    if(order_details.customer_type == 'private'){
        order_details.customer_type = 'פרטי';
        var private_stat = $('.stat-cont').eq(1).text().split(':');
        var private_count = parseInt(private_stat[1]);
        $('.stat-cont:eq(1) p').html(private_stat[0]+':'+' '+(private_count + val));
    }

    if(order_details.order_type == 'delivery'){
        order_details.order_type = 'משלוח';
        var delivery_stat = $('.stat-cont').eq(2).text().split(':');
        var delivery_count = parseInt(delivery_stat[1]);
        $('.stat-cont:eq(2) p').html(delivery_stat[0]+':'+' '+(delivery_count + val));
    }

    if(order_details.order_type == 'take-away'){
        order_details.order_type = 'לקחת';
        var ta_stat = $('.stat-cont').eq(3).text().split(':');
        var ta_count = parseInt(ta_stat[1]);
        $('.stat-cont:eq(3) p').html(ta_stat[0]+':'+' '+(ta_count + val));
    }

    if(order_details.order_type == 'sit'){
        order_details.order_type = 'לשבת';
        var sit_stat = $('.stat-cont').eq(4).text().split(':');
        var sit_count = parseInt(sit_stat[1]);
        $('.stat-cont:eq(4) p').html(sit_stat[0]+':'+' '+(sit_count + val));
    }

    if(order_details.payment_method == 'cash'){
        order_details.payment_method = 'מזומן';
        var cash_stat = $('.stat-cont').eq(5).text().split(':');
        var cash_count = parseInt(cash_stat[1]);
        $('.stat-cont:eq(5) p').html(cash_stat[0]+':'+' '+(cash_count + val));
    }

    if(order_details.payment_method == 'credit'){
        order_details.payment_method = 'אשראי';
        var credit_stat = $('.stat-cont').eq(6).text().split(':');
        var credit_count = parseInt(credit_stat[1]);
        $('.stat-cont:eq(6) p').html(credit_stat[0]+':'+' '+(credit_count + val));
    }
}

function get_customer_array(customer, customer_type){
    var company_code = '', company_name = '';
    if(customer_type == 'business'){
        company_code = customer.company_code;
        company_name = customer.company_name;
    }
    return [
        {label: 'שם פרטי:', info: customer.first_name},
        {label: 'שם משפחה:', info: customer.last_name},
        {label: 'מספר טלפון:', info: customer.phone_number},
        {label: 'דוא"ל:', info: customer.email},
        {label: 'קוד חברה:', info: company_code},
        {label: 'שם חברה:', info: company_name},
        {label: 'רחוב:', info: customer.street},
        {label: 'מספר בית:', info: customer.house_number},
        {label: 'קומה:', info: customer.floor},
        {label: 'כניסה:', info: customer.enter}
    ];
}

function get_order_cont_elm(data){
    var order_obj = JSON.parse(data.order_text);
    var cart = JSON.parse(order_obj.my_cart);
    var customer = data.customer;
    var order_details = data.order;
    var serial_number = data.serial_number;
    var order_id = data.order_id;
    var status = data.status;
    customer = get_customer_array(customer, order_details.customer_type);
    update_statistics(order_details, 1);
    var total_price = 'סה"כ: ';
    total_price += order_details.total_price + ' ';
    total_price += '&#8362;';
    var html = '' +
        '<section class="order-cont">' +
        '<section class="order-details-cont">' +
        '<section class="serial-number"><p>'+serial_number+'</p></section>' +
        '<section class="order-detail-cont background" id="customer-type"><p>'+order_details.customer_type+'</p></section>' +
        '<section class="order-detail-cont background" id="order-type"><p>'+order_details.order_type+'</p></section>' +
        '<section class="order-detail-cont background" id="payment-method"><p>'+order_details.payment_method+'</p></section>' +
        '<section class="order-detail-cont background" id="order-time">' +
        '<p class="blink_me">'+order_details.order_time+'</p>' +
        '<section class="order-time-edit"><select class="minutes"></select>:<select class="hours"></select></section>' +
        '</section>' +
        '</section>' +
        '<section class="customer-details-cont background">' +
        '<section class="column">';
    for(var i = 0; i < 5; i++) {
        html += '' +
        '<section class="row">' +
        '<section class="label"><p>'+customer[i].label+'</p></section>' +
        '<section class="info"><p>'+customer[i].info+'</p></section>' +
        '</section>';
    }
    html += '' +
    '</section>' +
    '<section class="column">';
    for(var i = 5; i < 10; i++) {
        html += '' +
        '<section class="row">' +
        '<section class="label"><p>'+customer[i].label+'</p></section>' +
        '<section class="info"><p>'+customer[i].info+'</p></section>' +
        '</section>';
    }
    html += '' +
    '</section>' +
    '</section>' +
    '<section class="cart-cont background">';
    for(var i = 0; i < cart.length; i++){
        html += '' +
        '<section class="cart-item-cont">' +
        '<section class="food-item background"><p>'+(i+1)+'.'+cart[i].name+'</p></section>' +
        '<section class="description background"><p>'+cart[i].description+'</p></section>';
        for(var j = 0; j < cart[i].addition_types.length; j++){
            html += '' +
            '<section class="description background"><p><span class="blink_me" style="font-size: 40px;">'+cart[i].addition_types[j].name+': '+'</span>';
            for(var k = 0; k < cart[i].addition_types[j].addition_items.length; k++){
                html += cart[i].addition_types[j].addition_items[k].name;
                if(k == cart[i].addition_types[j].addition_items.length - 1) html += '.';
                else html += ', ';
            }
            html += '' +
            '</p></section>';
        }
        html += ''+
        '</section>';
    }
    html += '' +
    '</section>' +
    '<footer class="background">' +
    '<section class="settings-cont">' +
    '<section class="button" id="close-order-'+order_id+'" title="סגור הזמנה">' +
    '<section class="icon"><p class="flaticon-close32"></p></section>' +
    '<section class="text"><p>סגור</p></section>' +
    '</section>' +
    '<section class="button" id="cancel-order" title="ביטול הזמנה">' +
    '<section class="icon"><p class="flaticon-forbidden"></p></section>' +
    '<section class="text"><p>ביטול</p></section>' +
    '</section>' +
    '</section>' +
    '<section class="status-cont"  name="<%= order_arr[i].phone_number %>" id="'+status+'">' +
    '<section class="status-item background-before" id="status-1"><p>הזמנה התקבלה</p></section>' +
    '<section class="status-item background-before" id="status-2"><p>בהכנה</p></section>' +
    '<section class="status-item background-before" id="status-3"><p></p></section>' +
    '<section class="status-item background-before" id="status-4"><p></p></section>' +
    '</section>' +
    '<section class="total-price-cont">' +
    '<p>'+total_price+'</p>' +
    '</section>' +
    '</footer>' +
    '</section>';

    return html;
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