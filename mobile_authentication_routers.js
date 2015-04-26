var express                           = require('express');
var mobile_authentication_routers     = express.Router();
var mobile_authentication_functions   = require('./mobile_authentication_functions');

mobile_authentication_routers.post('/sign-up', function(req, res){
    mobile_authentication_functions.sign_up(req, res);
});

mobile_authentication_routers.post('/log-in', function(req, res){
    mobile_authentication_functions.log_in(req, res);
});

module.exports = mobile_authentication_routers;