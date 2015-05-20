var express = require('express');
var menu_items = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

menu_items.get('/menu-items&:menu_type_id&:menu_type_name', function(req, res){

    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var menu_type_name = req.params.menu_type_name.split('=')[1];
    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '/menu-types', name: 'ניהול תפריט'}, {path: '#', name: menu_type_name}];

    var query = '';
    query += "SELECT fi.id, fi.food_type_id, fi.name, fi.description, fi.price, fi.seal, i.image_name ";
    query += "FROM food_items fi ";
    query += "LEFT JOIN food_items_images fii ON fi.id = fii.food_item_id AND fii.active='1' ";
    query += "LEFT JOIN images i ON fii.image_id = i.id ";
    query += "WHERE fi.food_type_id='"+menu_type_id+"';";

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('menu-items', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        menu_items: result,
                        menu_type_id: menu_type_id,
                        menu_type_name: menu_type_name
                    });
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

});

menu_items.post('/conceal-menu-item&:menu_type_id&:menu_item_id', function(req, res){

    var menu_item_id = req.params.menu_item_id.split('=')[1];
    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var query = 'SELECT (SELECT COUNT(*) FROM `food_items` WHERE `food_type_id`="'+menu_type_id+'") AS tot_count, (SELECT COUNT(*) FROM `food_items` WHERE `food_type_id`="'+menu_type_id+'" AND `seal`="1") AS sealed_count;';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if((result[0].tot_count - result[0].sealed_count) >= 2){
                        query = 'UPDATE `food_items` SET `seal`="1" WHERE `id`='+menu_item_id+';';
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
                conn.release();
            });
        }
        else{console.log(err);}
    });
});

menu_items.post('/delete-menu-item&:menu_type_id&:menu_item_id', function(req, res){

    var menu_item_id = req.params.menu_item_id.split('=')[1];
    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var query = 'SELECT (SELECT COUNT(*) FROM `food_items` WHERE `food_type_id`="'+menu_type_id+'") AS tot_menu_items_count, ' +
        '(SELECT COUNT(*) FROM `food_items` WHERE `food_type_id`="'+menu_type_id+'" AND `seal`="1") AS sealed_menu_items_count, ' +
        '(SELECT `seal` FROM `food_items` WHERE `id`="'+menu_item_id+'") AS is_sealed;';
    mysql.getConnection(function(err, conn){
        if(!err) {
            conn.query(query, function (err, result){
                if (!err) {
                    var tot_menu_items_count = result[0].tot_menu_items_count;
                    var sealed_menu_items_count = result[0].sealed_menu_items_count;
                    var is_sealed = result[0].is_sealed;
                    if((is_sealed) || ((tot_menu_items_count - sealed_menu_items_count) >= 2)) delete_menu_item(res, menu_type_id, menu_item_id);
                    else{
                        var msg = 'המחיקה אסורה, ייתכן שמדובר בפריט האחרון שנותר בקטגוריה הזו ';
                        msg += 'או שמדובר בפריט האחרון בקטגוריה הזו שאינו מוסתר ללקוח';
                        res.send({status: false, msg: msg});
                    }
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה במחיקת הפריט, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            console.log("There was an error with MySQL Query: " + query + ' ' + err);
            res.send({status: false, msg: 'הייתה בעיה במחיקת הפריט, אנא נסה שוב מאוחר יותר'});
        }
    });

});

menu_items.post('/reveal-menu-item&:menu_type_id&:menu_item_id', function(req, res){

    var menu_item_id = req.params.menu_item_id.split('=')[1];
    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var query = 'UPDATE `food_items` SET `seal`="0" WHERE `id`='+menu_item_id+';';
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
                conn.release();
            });
        }
        else{console.log(err);}
    });

});

function delete_menu_item(res, menu_type_id, menu_item_id){
    var query = 'DELETE FROM `food_items` WHERE `id`="'+menu_item_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err) {
            conn.query(query, function (err, result) {
                if (!err) {
                    query = 'DELETE FROM `food_items_additions` WHERE `food_item_id`="' + menu_item_id + '";';
                    conn.query(query, function (err, result) {
                        if (!err) {
                            query = 'DELETE FROM `food_items_images` WHERE `food_item_id`="' + menu_item_id + '";';
                            conn.query(query, function () {
                                if (!err) {
                                    res.send({status: true, msg: ''});
                                }
                                else {
                                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                    res.send({
                                        status: false,
                                        msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נשה שוב מאוחר יותר'
                                    });
                                }
                            });
                        }
                        else {
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נשה שוב מאוחר יותר'});
                        }
                    });
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נשה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            console.log("There was an error with MySQL Query: " + query + ' ' + err);
            res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נשה שוב מאוחר יותר'});
        }
    });
}

module.exports = menu_items;