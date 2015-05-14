var express = require('express');
var menu_additions = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

menu_additions.get('/menu-additions&:menu_type_id&:menu_type_name&:menu_item_id&:menu_item_name', function(req, res){

    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var menu_type_name = req.params.menu_type_name.split('=')[1];
    var menu_item_id = req.params.menu_item_id.split('=')[1];
    var menu_item_name = req.params.menu_item_name.split('=')[1];
    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name, name: menu_type_name},
        {path: '#', name: menu_item_name}];

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
    query += "LEFT JOIN addition_items_images aii ON ai.id = aii.addition_item_id ";
    query += "LEFT JOIN ai_images i ON aii.image_id = i.id ";
    query += "WHERE fia.food_item_id='"+menu_item_id+"' AND i.active='1';";

    //query += "LEFT JOIN fi_images i ON fii.image_id = i.id ";
    //query += "WHERE fi.food_type_id='"+food_type_id+"' AND i.active='1';";

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                // Query each row arguments -
                // for ADDITION_TYPE: addition_type_id, addition_type_name, addition_type_description, selection_type, selections_amount
                // for ADDITION_ITEM: addition_item_id, addition_item_name, addition_item_description, image, price
                // For each addition item we have the above information and we need to group it by addition types using the getAddition() function
                if(!err){
                    var addition_types = getAdditions(result);
                    res.render('menu-additions', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        menu_type_id: menu_type_id,
                        menu_type_name: menu_type_name,
                        menu_item_id: menu_item_id,
                        menu_item_name: menu_item_name,
                        addition_types: addition_types
                    });
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });

});

function getAdditions(menu_additions){
    var additions = [];
    var i = 0, j = 0;
    var new_addition_obj = new additionType(menu_additions[0]);
    additions.push(new_addition_obj);

    var tmpID = additions[0].id;
    for(i = 1; i <  menu_additions.length; i++){
        if(menu_additions[i].addition_type_id != tmpID){
            new_addition_obj = new additionType(menu_additions[i]);
            additions.push(new_addition_obj);
            tmpID = menu_additions[i].addition_type_id;
        }
    }

    for(i = 0; i < additions.length; i++){
        for(j = 0; j < menu_additions.length; j++){
            if(menu_additions[j].addition_type_id == additions[i].id){
                var new_addition_item = new additionItem(menu_additions[j]);
                additions[i].addition_items.push(new_addition_item);
            }
        }
    }

    return additions;
}

function additionType(type){
    this.id = type.addition_type_id;
    this.name = type.addition_type_name;
    this.description = type.addition_type_description;
    this.selection_type = type.selection_type;
    this.selections_amount = type.selections_amount;
    this.addition_items = [];
}

function additionItem(item){
    this.id = item.addition_item_id;
    this.name = item.addition_item_name;
    this.description = item.addition_item_description;
    this.image = item.image;
    this.price = item.price;
}

module.exports = menu_additions ;