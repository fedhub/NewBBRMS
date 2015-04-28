var express                = require('express');
var mobile_menu_routers    = express.Router();
var mobile_menu_functions  = require('./mobile_menu_functions');

mobile_menu_routers.post('/menu-types', function(req, res){
    mobile_menu_functions.menu_types(req, res);
});

mobile_menu_routers.post('/menu-items&:food_type_id', function(req, res){
    mobile_menu_functions.menu_items(req, res);
});

mobile_menu_routers.post('/menu-additions&:food_item_id', function(req, res){
    mobile_menu_functions.menu_additions(req, res);
});

module.exports = mobile_menu_routers;

