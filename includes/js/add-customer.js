//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#approve-customer').click(function(){
        var msg = input_checks();
        if(msg.length > 0) alert(msg);
        else add_customer_ajax();
    });

});

function input_checks(){
    var msg = '';
    if($('input').eq(0).val().length == 0) msg += 'הזן שם פרטי. ';
    if($('input').eq(1).val().length == 0) msg += 'הזן שם משפחה. ';
    if($('input').eq(2).val().length == 0) msg += 'הזן מספר טלפון. ';
    if($('input').eq(4).val().length == 0) msg += 'הזן רחוב. ';
    if($('input').eq(5).val().length == 0) msg += 'הזן מספר בית. ';
    if($('input').eq(6).val().length == 0) msg += 'הזן קומה. ';
    if($('input').eq(8).val().length == 0) msg += 'הזן יתרה. ';
    if($('input').eq(9).val().length == 0) msg += 'הזן סיסמה ראשונית עבור הלקוח. ';
    return msg;
}

function get_customer_obj(){
    return {
        first_name: $('input').eq(0).val(),
        last_name: $('input').eq(1).val(),
        phone_number: $('input').eq(2).val(),
        email: $('input').eq(3).val(),
        street: $('input').eq(4).val(),
        house_number: $('input').eq(5).val(),
        floor: $('input').eq(6).val(),
        enter: $('input').eq(7).val(),
        budget: $('input').eq(8).val(),
        password: $('input').eq(9).val(),
        company_code: $('.add-customer-cont').attr('id').split('-')[1]
    }
}

function add_customer_ajax(){
    var url = base_url + '/add-customer';
    var id_params = $('.add-customer-cont').attr('id').split('-');
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(get_customer_obj())}
    }).done(function(res){
        if(res.status) window.location = base_url + '/company&company_name='+id_params[0]+'&company_code='+id_params[1];
        else alert(res.msg);
    })
}