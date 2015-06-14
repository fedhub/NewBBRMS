//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#add-customer').click(function(){
        var id_params = $('.company-cont').attr('id').split('-');
        var company_name = id_params[0];
        var company_code = id_params[1];
        window.location = base_url + '/add-customer-page&company_name='+company_name+'&company_code='+company_code;
    });

    $('.budget').click(function(){
        window.location = base_url + '/customer-deposits&customer_id='+$(this).parent().attr('id');
    });

});