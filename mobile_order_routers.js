var express                = require('express');
var mobile_order_routers   = express.Router();
var mobile_order_functions = require('./mobile_order_functions');

mobile_order_routers.post('/make-order', function(req, res){
    mobile_order_functions.make_order(req, res);
});

mobile_order_routers.post('/last-orders&:phone_number', function(req, res){
    mobile_order_functions.last_orders(req, res);
});

module.exports = mobile_order_routers;