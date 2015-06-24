$(document).ready(function() {

    $('#approve-company').click(function(){
        var msg = input_checks();
        if(msg.length > 0) alert(msg);
        else add_company_ajax();
    });

});

function input_checks(){
    var msg = '';
    if($('input').eq(0).val().length == 0) msg += 'הזן שם חברה. ';
    if($('input').eq(1).val().length == 0) msg += 'הזן רחוב. ';
    if($('input').eq(2).val().length == 0) msg += 'הזן מספר בית. ';
    if($('input').eq(3).val().length == 0) msg += 'הזן קומה. ';
    if($('input').eq(5).val().length == 0) msg += 'הזן קוד חברה. ';
    if($('input').eq(6).val().length == 0) msg += 'הזן טלפון איש קשר. ';
    return msg;
}

function get_company_obj(){
    return {
        company_name: $('input').eq(0).val(),
        street: $('input').eq(1).val(),
        house_number: $('input').eq(2).val(),
        floor: $('input').eq(3).val(),
        enter: $('input').eq(4).val(),
        company_code: $('input').eq(5).val(),
        representative: $('input').eq(6).val()
    }
}

function add_company_ajax(){
    var url = base_url + '/add-company';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(get_company_obj())}
    }).done(function(res){
        if(res.status) window.location = base_url + '/business-companies';
        else alert(res.msg);
    })
}