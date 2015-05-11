var express    = require('express');
var settings      = express.Router();

// Authentication
var is_connected = false;
var is_admin = false;

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

module.exports = settings;