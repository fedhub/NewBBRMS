var express                           = require('express');
var mobile_authentication_routers     = express.Router();
var mobile_authentication_functions   = require('./mobile_authentication_functions');

mobile_authentication_routers.post('/sign-up', function(req, res){
    mobile_authentication_functions.sign_up(req, res);
});

mobile_authentication_routers.post('/log-in&:customer_type', function(req, res){
    var customer_type = req.params.customer_type.split('=')[1];
    if(customer_type == 'private') mobile_authentication_functions.log_in_private(req, res);
    if(customer_type == 'business') mobile_authentication_functions.log_in_business(req, res);
});

module.exports = mobile_authentication_routers;