var express                 = require('express');
var mobile_menu_functions   = express.Router();
var mysql                   = require('./mysql');

// Fetch the menu types
mobile_menu_functions.menu_types = function(req, res){

    var query = '';
    query += "SELECT ft.id, ft.name, i.image_name ";
    query += "FROM food_types ft ";
    query += "LEFT JOIN food_types_images fti ON ft.id = fti.food_type_id ";
    query += "LEFT JOIN ft_images i ON fti.image_id = i.id AND i.active='1';";

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send(result);
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send(false);
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });

}

// Fetch the menu items
mobile_menu_functions.menu_items = function(req, res){

    var food_type_id = req.params.food_type_id.split("=");
    food_type_id = food_type_id[food_type_id.length - 1];

    //AND fi.food_type_id='"+food_type_id+"'

    var query = '';
    query += "SELECT fi.id, fi.food_type_id, fi.name, fi.description, fi.price, i.image_name ";
    query += "FROM food_items fi ";
    query += "LEFT JOIN food_items_images fii ON fi.id = fii.food_item_id ";
    query += "LEFT JOIN fi_images i ON fii.image_id = i.id AND i.active='1' ";
    query += "WHERE fi.food_type_id='"+food_type_id+"';";

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send(result);
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send(false);
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });

}

module.exports = mobile_menu_functions;


