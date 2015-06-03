//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#add-company').click(function(){
        window.location = base_url + '/add-company-page';
    });

    $('.company-row').click(function(){
        var id_params = $(this).attr('id').split('-');
        window.location = base_url + '/company&company_name='+id_params[0]+'&company_code='+id_params[1];
    });

});