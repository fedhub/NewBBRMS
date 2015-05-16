var express = require('express');
var menu_types = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

menu_types.get('/menu-types', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '#', name: 'ניהול תפריט'}];
    var query = '';
    query += "SELECT ft.id, ft.name, ft.seal, i.image_name ";
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

menu_types.post('/conceal-menu-type&:menu_type_id', function(req, res){

    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var query = 'SELECT (SELECT COUNT(*) FROM `food_types`) AS tot_count, (SELECT COUNT(*) FROM `food_types` WHERE `seal`="1") AS sealed_count;';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if((result[0].tot_count - result[0].sealed_count) >= 2){
                        query = 'UPDATE `food_types` SET `seal`="1" WHERE `id`='+menu_type_id+';';
                        mysql.getConnection(function(err, conn){
                            if(!err){
                                conn.query(query, function(err, result){
                                    if(!err){
                                        res.send({status: true, msg: ''});
                                    }
                                    else {
                                        console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                        res.send({status: false, msg: 'הייתה בעיה בעדכון ההסתרה של הפריט, אנא נסה שוב מאוחר יותר'});
                                    }
                                });
                            }
                            else{console.log(err);}
                        });
                    }
                    else{
                        res.send({status: false, msg: 'מדובר בפריט האחרון בקטגוריה זו שאינו מוסתר ולכן לא ניתן להסתיר אותו מהמשתמשים מאחר וזה עלול לגרום לשיבושים בתפקוד של האפליקצייה'});
                    }
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון ההסתרה של הפריט, אנא נסה שוב מאוחר יותר'});
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });
});

menu_types.post('/reveal-menu-type&:menu_type_id', function(req, res){

    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var query = 'UPDATE `food_types` SET `seal`="0" WHERE `id`='+menu_type_id+';';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true, msg: ''});
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך חשיפת הפריט, אנא נסה שוב מאוחר יותר'});
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });

});

module.exports = menu_types;