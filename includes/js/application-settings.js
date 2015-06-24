var new_open_minutes, new_open_hour, new_close_minutes, new_close_hour,
    new_delivery, new_sit, new_take_away;
var open_minutes, open_hour, close_minutes, close_hour, delivery, sit, take_away;

$(document).ready(function() {

    open_minutes = $('select').eq(0).attr('id').split('-')[2];
    open_hour = $('select').eq(1).attr('id').split('-')[2];
    close_minutes = $('select').eq(2).attr('id').split('-')[2];
    close_hour = $('select').eq(3).attr('id').split('-')[2];
    delivery = $('select').eq(4).attr('id').split('-')[1];
    sit = $('select').eq(5).attr('id').split('-')[1];
    take_away = $('select').eq(6).attr('id').split('-')[2];

    $('select').eq(0).val(open_minutes);
    $('select').eq(1).val(open_hour);
    $('select').eq(2).val(close_minutes);
    $('select').eq(3).val(close_hour);

    if(delivery == '1') $('select').eq(4).val(1);
    if(delivery == '0') $('select').eq(4).val(0);

    if(sit == '1') $('select').eq(5).val(1);
    if(sit == '0') $('select').eq(5).val(0);

    if(take_away == '1') $('select').eq(6).val(1);
    if(take_away == '0') $('select').eq(6).val(0);

    $('#approve-application-settings').click(function(){
        set_new_values();
        if(! changed()) alert('לא בוצעו שינויים');
        else set_application_settings(get_settings_json());
    });

});

function set_new_values(){
    new_open_minutes = $('select').eq(0).val();
    new_open_hour = $('select').eq(1).val();
    new_close_minutes = $('select').eq(2).val();
    new_close_hour = $('select').eq(3).val();
    new_delivery = $('select').eq(4).val();
    new_sit = $('select').eq(5).val();
    new_take_away = $('select').eq(6).val();
}

function changed(){
    var changed = false;
    if(new_open_minutes != open_minutes) changed = true;
    if(new_open_hour != open_hour) changed = true;
    if(new_close_minutes != close_minutes) changed = true;
    if(new_close_hour != close_hour) changed = true;
    if(new_delivery != delivery) changed = true;
    if(new_sit != sit) changed = true;
    if(new_take_away != take_away) changed = true;
    return changed;
}

function get_settings_json(){
    return {
        open_minutes: new_open_minutes,
        open_hour: new_open_hour,
        close_minutes: new_close_minutes,
        close_hour: new_close_hour,
        delivery: new_delivery,
        sit: new_sit,
        take_away: new_take_away
    };
}

function set_application_settings(settings){
    var url = base_url + '/set-application-settings';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(settings)}
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else window.location = base_url + '/application-settings';
    });
}