var express                = require('express');
var mobile_order_routers   = express.Router();
var mobile_order_functions = require('./mobile_order_functions');

mobile_order_routers.post('/make-order', function(req, res){
    mobile_order_functions.make_order(req, res);
});

mobile_order_routers.post('/last-orders&:phone_number', function(req, res){
    mobile_order_functions.last_orders(req, res);
});

mobile_order_routers.post('/new-library', function(req, res){
    mobile_order_functions.new_library(req, res);
});

mobile_order_routers.post('/get-libraries&:phone_number', function(req, res){
    mobile_order_functions.get_libraries(req, res);
});

mobile_order_routers.post('/library-items&:library_id', function(req, res){
    mobile_order_functions.library_items(req, res);
});

mobile_order_routers.post('/add-library-item', function(req, res){
    mobile_order_functions.add_library_item(req, res);
});

mobile_order_routers.post('/update-library', function(req, res){
    mobile_order_functions.update_library(req, res);
});

mobile_order_routers.post('/delete-from-library', function(req, res){
    mobile_order_functions.delete_from_library(req, res);
});

mobile_order_routers.post('/delete-library', function(req, res){
    mobile_order_functions.delete_library(req, res);
});

mobile_order_routers.post('/decrease-from-budget', function(req, res){
    mobile_order_functions.decrease_from_budget(req, res);
});

module.exports = mobile_order_routers;