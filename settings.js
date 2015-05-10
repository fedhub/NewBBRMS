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

module.exports = settings;