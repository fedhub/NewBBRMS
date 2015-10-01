var express = require('express');
var settings = express.Router();
var mysql = require('./mysql');

// Authentication
var is_connected = false;
var is_admin = false;
var menu_stamp = 0;

settings.init_menu_stamp = function(stamp){
    menu_stamp = stamp;
};

settings.inc_menu_stamp = function(){
    menu_stamp++;
    mysql.getConnection(function(err, conn){
        if(!err){
            var query = 'UPDATE `application_settings` SET `menu_stamp`='+menu_stamp+' WHERE 1';
            conn.query(query);
            conn.release();
        }
        else console.log('failed to get connection');

    });
};

settings.get_menu_stamp = function(){
    return menu_stamp;
};

settings.get_is_connected = function(){
    return is_connected;
};

settings.get_is_admin = function(){
    return is_admin;
};

settings.set_is_connected = function(state){
    is_connected = state;
};

settings.set_is_admin = function(state){
    is_admin = state;
};

// Manager Details
var manager = {};

settings.set_manager = function(details){
    manager = {
        id: details.id,
        first_name: details.first_name,
        last_name: details.last_name,
        phone_number: details.phone_number,
        email: details.email,
        admin: details.admin,
        username: details.username,
        password: details.password
    };
};

settings.get_manager = function(){
    return manager;
};

settings.get_manager_id = function(){
    return manager.id;
};

settings.get_username = function(){
    return manager.username;
};

settings.reset_manager = function(){
    manager = {};
};

// Reset
settings.reset_sys = function(){
    settings.set_is_connected(false);
    settings.set_is_admin(false);
    settings.reset_manager();
};

// pending_orders

var delivery_count = 0;
var take_away_count = 0;
var sit_count = 0;
var business_count = 0;
var private_count = 0;
var credit_count = 0;
var cash_count = 0;
// increment
settings.inc_delivery_count = function(){
    delivery_count++;
};
settings.inc_take_away_count = function(){
    take_away_count++;
};
settings.inc_sit_count = function(){
    sit_count++;
};
settings.inc_business_count = function(){
    business_count++;
};
settings.inc_private_count = function(){
    private_count++;
};
settings.inc_credit_count = function(){
    credit_count++;
};
settings.inc_cash_count = function(){
    cash_count++;
};
//getters
settings.get_delivery_count = function(){
    return delivery_count;
};
settings.get_take_away_count = function(){
    return take_away_count;
};
settings.get_sit_count = function(){
    return sit_count;
};
settings.get_business_count = function(){
    return business_count;
};
settings.get_private_count = function(){
    return private_count;
};
settings.get_credit_count = function(){
    return credit_count;
};
settings.get_cash_count = function(){
    return cash_count;
};
// reset
settings.reset_stats = function(){
    delivery_count = 0;
    take_away_count = 0;
    sit_count = 0;
    business_count = 0;
    private_count = 0;
    credit_count = 0;
    cash_count = 0;
};

module.exports = settings;