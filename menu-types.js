var express = require('express');
var menu_types = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

menu_types.get('/menu-types', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '#', name: 'ניהול תפריט'}];

    var query = '';
    query += "SELECT ft.id, ft.name, i.image_name ";
    query += "FROM food_types ft ";
    query += "LEFT JOIN food_types_images fti ON ft.id = fti.food_type_id ";
    query += "LEFT JOIN ft_images i ON fti.image_id = i.id ";
    query += "WHERE i.active='1';";

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('menu-types', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        menu_types: result
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

module.exports = menu_types;