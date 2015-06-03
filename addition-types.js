var express = require('express');
var addition_types = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

addition_types.get('/delete-addition-types&:parameters', function(req, res){

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
                    res.render('delete-addition-types', {
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
                run_query_delete(conn, food_items_arr[i], addition_type_id);
            }
            conn.release();
            res.send({status: true});
        }
        else res.send({status: false, msg: 'הייתה בעיה במחיקת סט התוספות, אנא נסה שוב מאוחר יותר'});
    });

});

function run_query_delete(conn, food_item_id, addition_type_id){
    var query = 'DELETE FROM `food_items_additions` WHERE `food_item_id`="'+food_item_id+'" AND `addition_type_id`="'+addition_type_id+'";';
    conn.query(query, function(err, result){});
}

addition_types.get('/edit-addition-type-page&:parameters', function(req, res){

    var params = req.params.parameters.split('=')[1];
    params = JSON.parse(params);
    // params => menu_type_id, menu_type_name, menu_item_id, menu_item_name, addition_type_id, addition_type_name

    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name, name: params.menu_type_name},
        {path: '/menu-additions&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name+'&menu_item_id='+params.menu_item_id+'&menu_item_name='+params.menu_item_name, name: params.menu_item_name},
        {path: '#', name: 'עריכת סט "'+ params.addition_type_name +'"'}];

    var query = 'SELECT * FROM `addition_types` WHERE `id`="'+params.addition_type_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var addition_type = {
                        id: result[0].id,
                        name: result[0].name,
                        description: result[0].description,
                        selection_type: result[0].selection_type,
                        selections_amount: result[0].selections_amount,
                        tot_unsealed_items: 0
                    };
                    query = 'SELECT (SELECT COUNT(*) FROM `addition_items` WHERE `addition_type_id`="'+addition_type.id+'") AS tot_addition_items_count  , ' +
                        '(SELECT COUNT(*) FROM `addition_items` WHERE `addition_type_id`="'+addition_type.id+'" AND `seal`="1") AS sealed_addition_items_count;';
                    conn.query(query, function(err, result){
                        if(!err){
                            var tot_addition_items_count = result[0].tot_addition_items_count;
                            var sealed_addition_items_count = result[0].sealed_addition_items_count;
                            addition_type.tot_unsealed_items = tot_addition_items_count - sealed_addition_items_count;
                            res.render('edit-addition-type', {
                                username: settings.get_username(),
                                breadcrumbs: breadcrumbs,
                                params: params,
                                addition_type: addition_type
                            });
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.render('404 page not found');
                        }
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

addition_types.post('/update-addition-type', function(req, res){

    var info = JSON.parse(req.body.data);
    var query = 'UPDATE `addition_types` SET ' +
        '`name`="'+info.new_name+'",' +
        '`description`="'+info.new_description+'",' +
        '`selection_type`="'+info.new_selection_type+'",' +
        '`selections_amount`="'+info.new_selections_amount+'" ' +
        'WHERE id="'+info.addition_type_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.render({status: false, msg: 'הייתה בעיה בעדכון סט התוספות, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון סט התוספות, אנא נסה שוב מאוחר יותר'});
        }
    });

});

addition_types.get('/link-addition-type-page&:parameters', function(req, res){

    var params = req.params.parameters.split('=')[1];
    params = JSON.parse(params);
    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name, name: params.menu_type_name},
        {path: '/menu-additions&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name+'&menu_item_id='+params.menu_item_id+'&menu_item_name='+params.menu_item_name, name: params.menu_item_name},
        {path: '#', name: 'שיוך סט "'+ params.addition_type_name +'"'}];
    var title = 'בחר לאילו פריטים לשייך את סט התוספות ';
    title += '"' + params.addition_type_name + '":';

    // select those who linked to this addition_type_id and group them by food_item_id
    var query = 'SELECT fia.food_item_id, fi.name AS food_item_name ' +
        'FROM food_items_additions fia ' +
        'LEFT JOIN food_items fi ON fi.id=fia.food_item_id ' +
        'WHERE fia.addition_type_id="'+params.addition_type_id+'" ' +
        'GROUP BY food_item_id;';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                var linked_food_items = result;
                if(!err){
                    // select all and group them by food_item_id
                    query = 'SELECT fia.food_item_id, fi.name AS food_item_name ' +
                        'FROM food_items_additions fia ' +
                        'LEFT JOIN food_items fi ON fi.id=fia.food_item_id ' +
                        'GROUP BY food_item_id;';
                    conn.query(query, function(err, result){
                        var all_food_items = result;
                        if(!err){
                            var unlinked_food_items = [];
                            // get all_food_items - linked_food_items = unlinked_food_items
                            for(var i = 0; i < all_food_items.length; i++){
                                var counter = 0;
                                for(var j = 0; j < linked_food_items.length; j++){
                                    counter++;
                                    if(all_food_items[i].food_item_id == linked_food_items[j].food_item_id){
                                        break;
                                    }
                                    if(counter == linked_food_items.length) unlinked_food_items.push(all_food_items[i]);
                                }
                            }
                            res.render('link-addition-type', {
                                username: settings.get_username(),
                                breadcrumbs: breadcrumbs,
                                params: params,
                                food_items: unlinked_food_items,
                                title: title
                            });
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.render('404 Not Fount');
                        }
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.render('404 Not Fount');
                }
                conn.release();
            });
        }
        else{
            res.render('404 Not Fount');
        }
    });

});

addition_types.post('/link-addition-set', function(req, res){

    var info = JSON.parse(req.body.data);
    var addition_type_id = info.addition_type_id;
    var food_items_arr = info.food_item_arr;

    mysql.getConnection(function(err, conn){
        if(!err){
            for(var i = 0; i < food_items_arr.length; i++){
                run_query_link(conn, food_items_arr[i], addition_type_id);
            }
            conn.release();
            res.send({status: true});
        }
        else res.send({status: false, msg: 'הייתה בעיה בשיוך סט התוספות, אנא נסה שוב מאוחר יותר'});
    });

});

function run_query_link(conn, food_item_id, addition_type_id){
    var query = 'INSERT INTO `food_items_additions`(`food_item_id`, `addition_type_id`) VALUES ("'+food_item_id+'","'+addition_type_id+'");';
    conn.query(query, function(err, result){});
}

addition_types.get('/add-addition-type-page&:parameters', function(req, res){

    var params = req.params.parameters.split('=')[1];
    params = JSON.parse(params);
    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name, name: params.menu_type_name},
        {path: '/menu-additions&menu_type_id='+params.menu_type_id+'&menu_type_name='+params.menu_type_name+'&menu_item_id='+params.menu_item_id+'&menu_item_name='+params.menu_item_name, name: params.menu_item_name},
        {path: '#', name: 'הוספת סט תוספות ל "'+ params.menu_item_name +'"'}];

    res.render('add-addition-type', {
        username: settings.get_username(),
        breadcrumbs: breadcrumbs,
        params: params
    });

});

addition_types.post('/add-addition-type', function(req, res){

// addition_type_name, addition_type_description, selection_type,
// selections_amount, addition_item_name, addition_item_price,
// addition_item_description, menu_type_id, menu_type_name, menu_item_id, menu_item_name
    var info = JSON.parse(req.body.data);
    var query = 'INSERT INTO `addition_types`(`name`, `description`, `selection_type`, `selections_amount`) VALUES ("'+info.addition_type_name+'","'+info.addition_type_description+'","'+info.selection_type+'","'+info.selections_amount+'");';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var addition_type_id = result.insertId;
                    query = 'INSERT INTO `addition_items`(`addition_type_id`, `name`, `description`, `price`) VALUES ("'+addition_type_id+'","'+info.addition_item_name+'","'+info.addition_item_description+'","'+info.addition_item_price+'");';
                    conn.query(query, function(err, result){
                        if(!err){
                            var addition_item_id = result.insertId;
                            query = 'INSERT INTO `food_items_additions`(`food_item_id`, `addition_type_id`) VALUES ("'+info.menu_item_id+'","'+addition_type_id+'");';
                            conn.query(query, function(err, result){
                               if(!err){
                                   query = 'INSERT INTO `addition_items_images`(`addition_item_id`, `image_id`, `active`) VALUES ("'+addition_item_id+'","55","1");';
                                   conn.query(query, function(err, result){
                                       if(!err){
                                           res.send({status: true});
                                       }
                                       else{
                                           console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                           res.send({status: false, msg: 'הייתה בעיה בהוספת הפריטים לפתריט, אנא נסה שוב מאוחר יותר'});
                                       }
                                   });
                               }
                               else{
                                   console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                   res.send({status: false, msg: 'הייתה בעיה בהוספת הפריטים לפתריט, אנא נסה שוב מאוחר יותר'});
                               }
                            });
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בהוספת הפריטים לפתריט, אנא נסה שוב מאוחר יותר'});
                        }
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהוספת הפריטים לפתריט, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהוספת הפריטים לפתריט, אנא נסה שוב מאוחר יותר'});
        }
    });

});

module.exports = addition_types;