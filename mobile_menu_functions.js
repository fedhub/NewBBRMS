var express                 = require('express');
var mobile_menu_functions   = express.Router();
var mysql                   = require('./mysql');

// Fetch the menu types
mobile_menu_functions.menu_types = function(req, res){

    var query = '';
    query += "SELECT ft.id, ft.name, i.image_name ";
    query += "FROM food_types ft ";
    query += "LEFT JOIN food_types_images fti ON ft.id = fti.food_type_id ";
    query += "LEFT JOIN images i ON fti.image_id = i.id ";
    query += "WHERE fti.active='1' AND ft.seal='0';";

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

};

// Fetch the menu items
mobile_menu_functions.menu_items = function(req, res){

    var food_type_id = req.params.food_type_id.split("=");
    food_type_id = food_type_id[food_type_id.length - 1];

    var query = '';
    query += "SELECT fi.id, fi.food_type_id, fi.name, fi.description, fi.price, i.image_name ";
    query += "FROM food_items fi ";
    query += "LEFT JOIN food_items_images fii ON fi.id = fii.food_item_id AND fii.active='1' ";
    query += "LEFT JOIN images i ON fii.image_id = i.id ";
    query += "WHERE fi.food_type_id='"+food_type_id+"' AND fi.seal='0';";

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

};

// Fetch the menu additions
mobile_menu_functions.menu_additions = function(req, res){

    var food_item_id = req.params.food_item_id.split("=");
    food_item_id = food_item_id[food_item_id.length - 1];

    var query = '';
    query += "SELECT at.id AS addition_type_id, " +
                    "at.name AS addition_type_name, " +
                    "at.description AS addition_type_description, " +
                    "at.selection_type, at.selections_amount, " +
                    "ai.id AS addition_item_id, " +
                    "ai.name AS addition_item_name, " +
                    "ai.description AS addition_item_description, " +
                    "ai.addition_type_id, " +
                    "ai.price, " +
                    "i.image_name AS image ";
    query += "FROM addition_types at ";
    query += "LEFT JOIN food_items_additions fia ON at.id = fia.addition_type_id ";
    query += "LEFT JOIN addition_items ai ON at.id=ai.addition_type_id ";
    query += "LEFT JOIN addition_items_images aii ON ai.id = aii.addition_item_id AND aii.active='1' ";
    query += "LEFT JOIN images i ON aii.image_id = i.id ";
    query += "WHERE fia.food_item_id='"+food_item_id+"' AND ai.seal='0';";

    //query += "LEFT JOIN fi_images i ON fii.image_id = i.id ";
    //query += "WHERE fi.food_type_id='"+food_type_id+"' AND i.active='1';";

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
                conn.release();
            });
        }
        else{console.log(err);}
    });

};

module.exports = mobile_menu_functions;


