var express = require('express');
var addition_types = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

addition_types.get('/addition-types&:parameters', function(req, res){

    var params = req.params.parameters.split('=')[1];
    params = JSON.parse(params);
    // params => menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id, addition_type_name

    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name, name: params.menu_type_name},
        {path: '/menu-additions&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name+'&menu_item_id='+params.menu_item_id+'&menu_item_name='+params.menu_item_name, name: params.menu_item_name},
        {path: '#', name: 'מחיקת סט "'+ params.addition_type_name +'"'}];
    var title = 'בחר מאילו פריטים למחוק את סט התוספות ';
    title += '"' + params.addition_type_name + '":';

    var query = 'SELECT fia.food_item_id, fi.name AS food_item_name ' +
        'FROM food_items_additions fia ' +
        'LEFT JOIN food_items fi ON fi.id=fia.food_item_id ' +
        'WHERE fia.addition_type_id="'+params.addition_type_id+'" ' +
        'AND fia.food_item_id ' +
        'IN ' +
        '(SELECT food_item_id ' +
        'FROM food_items_additions ' +
        'GROUP BY food_item_id ' +
        'HAVING COUNT(*)>1)';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('addition-types', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        params: params,
                        food_items: result,
                        title: title
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.render('404 page not found');
                }
                conn.release();
            });
        }
        else{
            res.render('404 page not found');
        }
    });

});

addition_types.post('/delete-addition-set', function(req, res){

    var info = JSON.parse(req.body.data);
    var addition_type_id = info.addition_type_id;
    var food_items_arr = info.food_item_arr;

    mysql.getConnection(function(err, conn){
        if(!err){
            for(var i = 0; i < food_items_arr.length; i++){
                run_query(conn, food_items_arr[i], addition_type_id);
            }
            conn.release();
            res.send({status: true});
        }
        else res.send({status: false, msg: 'הייתה בעיה במחיקת סט התוספות, אנא נסה שוב מאוחר יותר'});
    });

});

function run_query(conn, food_item_id, addition_type_id){
    var query = 'DELETE FROM `food_items_additions` WHERE `food_item_id`="'+food_item_id+'" AND `addition_type_id`="'+addition_type_id+'";';
    conn.query(query, function(err, result){});
}

module.exports = addition_types;