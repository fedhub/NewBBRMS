//var base_url = 'http://www.best-biss.com';
//var base_url = 'http://best-biss.herokuapp.com';
var base_url = 'http://localhost:3000';

$(document).ready(function() {

    $('#managers').click(function(){window.location = base_url+'/managers';});
    $('#application-settings').click(function(){window.location = base_url+'/application-settings';});
    $('#menu-management').click(function(){window.location = base_url+'/menu-types';});
    $('#business-customers').click(function(){window.location = base_url+'/business-companies';});
    $('#control-panel').click(function(){window.location = base_url+'/pending-orders';});
    $('#coupons').click(function(){window.location = '#';});
    $('#statistics').click(function(){window.location = '#';});
    $('#queries').click(function(){window.location = '#';});
    $('#system-backup').click(function(){window.location = '#';});

});