$(document).ready(function() {

    $('#deposit').click(function(){
        var msg = '';
        var $amount = $('#amount').val();
        if($amount.length == 0) msg += 'הזן סכום להפקדה. ';
        if(!$amount.match(/^\d+$/)) msg += 'רק ספרות מותרות';
        if(msg.length > 0) alert(msg);
        else make_deposit();
    });

});

function make_deposit(){
    var id_params = $('.deposit-cont').attr('id').split('-');
    var url = base_url + '/make-deposit&phone_number='+id_params[0]+'&company_code='+id_params[1]+'&deposit='+$('#amount').val()+'&budget='+id_params[3];
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else window.location = '/customer-deposits&customer_id='+id_params[2];
    });
}