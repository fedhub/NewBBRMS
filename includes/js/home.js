$(document).ready(function() {

    $('#managers').click(function(){window.location = base_url+'/managers';});
    $('#application-settings').click(function(){window.location = base_url+'/application-settings';});
    $('#menu-management').click(function(){window.location = base_url+'/menu-types';});
    $('#business-customers').click(function(){window.location = base_url+'/business-companies';});
    $('#control-panel').click(function(){window.location = base_url+'/pending-orders';});
    $('#coupons').click(function(){window.location = '#';});
    $('#statistics').click(function(){window.location = '#';});
    $('#queries').click(function(){window.location = '/queries';});
    $('#system-backup').click(function(){window.location = '/backup';});
    $('#pending-orders').click(function(){window.location = '/manager-pending-orders';});

});