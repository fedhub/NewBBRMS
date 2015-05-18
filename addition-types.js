var express = require('express');
var addition_types = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

addition_types.post('/addition-types', function(req, res){

    // info: menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id
    var info = JSON.parse(req.body.data);

    var menu_type_id = info.menu_type_id;
    var menu_type_name = info.menu_type_name;
    var menu_item_id = info.menu_item_id;
    var menu_item_name = info.menu_item_name;
    var addition_type_id = info.addition_type_id;

    var query = 'SELECT COUNT(food_item_id), `food_item_id` ' +
        'FROM `food_items_additions` ' +
        'WHERE `addition_type_id`="'+addition_type_id+'" ' +
        'GROUP BY food_item_id ' +
        'HAVING COUNT(food_item_id)>1;';

    //var query = 'SELECT `food_item_id` AS id FROM `food_items_additions` WHERE `addition_type_id`="'+addition_type_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    for(var i = 0; i < result.length; i++)
                        console.log(result[i].food_item_id);
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    //res.send({status: false, msg: 'הייתה בעיה בהבאת העמוד המבוקש, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            //res.send({status: false, msg: 'הייתה בעיה בהבאת העמוד המבוקש, אנא נסה שוב מאוחר יותר'});
        }
    });

});

module.exports = addition_types;