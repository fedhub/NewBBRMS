var express = require('express');
var menu_items = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');
var fs = require('fs');

menu_items.get('/menu-items&:menu_type_id&:menu_type_name', function(req, res){

    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var menu_type_name = req.params.menu_type_name.split('=')[1];
    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '/menu-types', name: 'ניהול תפריט'}, {path: '#', name: menu_type_name}];

    var query = '';
    query += "SELECT fi.id, fi.food_type_id, fi.name, fi.description, fi.price, fi.seal, i.image_name ";
    query += "FROM food_items fi ";
    query += "LEFT JOIN food_items_images fii ON fi.id = fii.food_item_id AND fii.active='1' ";
    //query += "LEFT JOIN food_items_images fii ON fi.id = fii.food_item_id AND fii.active='1' ";
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
                        //mysql.getConnection(function(err, conn){
                            //if(!err){
                                conn.query(query, function(err, result){
                                    if(!err){
                                        settings.inc_menu_stamp();
                                        res.send({status: true, msg: ''});
                                    }
                                    else {
                                        console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                        res.send({status: false, msg: 'הייתה בעיה בעדכון ההסתרה של הפריט, אנא נסה שוב מאוחר יותר'});
                                    }
                                });
                            //}
                            //else{console.log(err);}
                        //});
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
                    settings.inc_menu_stamp();
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

menu_items.get('/add-menu-item-page&:menu_type_id&:menu_type_name', function(req, res){

    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var menu_type_name = req.params.menu_type_name.split('=')[1];
    var name = 'הוספת פריט ל';
    name += menu_type_name;
    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name, name: menu_type_name},
        {path: '#', name: name}];
    res.render('add-menu-item', {
        username: settings.get_username(),
        breadcrumbs: breadcrumbs,
        menu_type_id: menu_type_id,
        menu_type_name: menu_type_name
    });

});

menu_items.post('/add-menu-item', function(req, res){

// addition_type_name, addition_type_description, selection_type,
// selections_amount, addition_item_name, addition_item_price,
// addition_item_description, menu_item_name, menu_item_price, menu_item_description,
// menu_type_id, menu_type_name
    var info = JSON.parse(req.body.data);
    var query = 'INSERT INTO `addition_types`(`name`, `description`, `selection_type`, `selections_amount`) VALUES ("'+info.addition_type_name+'","'+info.addition_type_description+'","'+info.selection_type+'","'+info.selections_amount+'");';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    settings.inc_menu_stamp();
                    var addition_type_id = result.insertId;
                    query = 'INSERT INTO `addition_items`(`addition_type_id`, `name`, `description`, `price`) VALUES ("'+addition_type_id+'","'+info.addition_item_name+'","'+info.addition_item_description+'","'+info.addition_item_price+'");';
                    conn.query(query, function(err, result){
                        if(!err){
                            var addition_item_id = result.insertId;
                            query = 'INSERT INTO `addition_items_images`(`addition_item_id`, `image_id`, `active`) VALUES ("'+addition_item_id+'","55","1");';
                            conn.query(query, function(err, result){
                                if(!err){
                                    query = 'INSERT INTO `food_items`(`food_type_id`, `name`, `description`, `price`) VALUES ("'+info.menu_type_id+'","'+info.menu_item_name+'","'+info.menu_item_description+'","'+info.menu_item_price+'")';
                                    conn.query(query, function(err, result){
                                        if(!err){
                                            var menu_item_id = result.insertId;
                                            query = 'INSERT INTO `food_items_images`(`food_item_id`, `image_id`, `active`) VALUES ("'+menu_item_id+'","55","1");';
                                            conn.query(query, function(err, result){
                                                if(!err){
                                                    query = 'INSERT INTO `food_items_additions`(`food_item_id`, `addition_type_id`) VALUES ("'+menu_item_id+'","'+addition_type_id+'");';
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

menu_items.get('/edit-menu-item&:params', function(req, res){

    var params = req.params.params.split('=')[1];
    params = JSON.parse(params);
    var menu_type_id = params.menu_type_id;
    var menu_type_name = params.menu_type_name;
    var menu_item_id = params.menu_item_id;
    var menu_item_name = params.menu_item_name;
    var menu_item_price = params.menu_item_price;
    var menu_item_description = params.menu_item_description;
    var name = 'עריכת ';
    name += menu_item_name;
    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name, name: menu_type_name},
        {path: '#', name: name}];

    var all_images = [];
    var related_images = [];
    var query = 'SELECT * FROM `images`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    all_images = result;
                    query = "SELECT fii.food_item_id, fii.image_id, fii.active, i.id, i.image_name " +
                    "FROM food_items_images fii " +
                    "LEFT JOIN images i ON fii.image_id=i.id " +
                    "WHERE fii.food_item_id='"+menu_item_id+"';";
                    conn.query(query, function(err, result){
                        if(!err){
                            related_images = result;
                            var stock_images = [];
                            for(var i = 0; i < all_images.length; i++){
                                var counter = 0;
                                for(var j = 0; j < related_images.length; j++){
                                    counter++;
                                    if(all_images[i].id == related_images[j].image_id){
                                        break;
                                    }
                                    if(counter == related_images.length) stock_images.push(all_images[i]);
                                }
                            }
                            res.render('edit-menu-item', {
                                username: settings.get_username(),
                                breadcrumbs: breadcrumbs,
                                params: params,
                                related_images: related_images,
                                all_images: stock_images
                            });
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send('הייתה בעייה בהבאת הדף המבוקש, אנא נסה שוב מאוחר יותר');
                        }
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send('הייתה בעייה בהבאת הדף המבוקש, אנא נסה שוב מאוחר יותר');
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעייה בהבאת הדף המבוקש, אנא נסה שוב מאוחר יותר'});
        }
    });

});

menu_items.post('/update-menu-item-details', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_item_id = info.menu_item_id;
    var name = info.name;
    var price = info.price;
    var description = info.description;
    var query = 'UPDATE `food_items` SET `name`="'+name+'",`description`="'+description+'",`price`="'+price+'" WHERE `id`="'+menu_item_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    settings.inc_menu_stamp();
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים, אנא נסה שוב מאוחר יותר'});
        }
    });

});

menu_items.post('/switch-item-related-image-selected', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_item_id = info.menu_item_id;
    var old_image_id = info.old_image_id;
    var new_image_id = info.new_image_id;

    var query = 'UPDATE `food_items_images` fii1 JOIN `food_items_images` fii2 ' +
        'ON fii1.food_item_id="'+menu_item_id+'" AND fii1.image_id="'+old_image_id+'" AND fii2.food_item_id="'+menu_item_id+'" AND fii2.image_id="'+new_image_id+'" ' +
        'SET fii1.active="0", ' +
        'fii2.active="1";';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    settings.inc_menu_stamp();
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון התמונה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון התמונה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

menu_items.post('/switch-item-stock-image-selected', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_item_id = info.menu_item_id;
    var old_image_id = info.old_image_id;
    var new_image_id = info.new_image_id;

    var query = 'UPDATE `food_items_images` SET `active`="0" WHERE `food_item_id`="'+menu_item_id+'" AND `image_id`="'+old_image_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    settings.inc_menu_stamp();
                    query = 'INSERT INTO `food_items_images`(`food_item_id`, `image_id`, `active`) VALUES ("'+menu_item_id+'","'+new_image_id+'","1");';
                    conn.query(query, function(err, result){
                        if(!err){
                            res.send({status: true});
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בעדכון התמונה, אנא נסה שוב מאוחר יותר'});
                        }
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון התמונה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון התמונה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

menu_items.post('/release-item-related-image', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_item_id = info.menu_item_id;
    var release_image_id = info.release_image_id;

    var query = 'DELETE FROM `food_items_images` WHERE `food_item_id`="'+menu_item_id+'" AND `image_id`="'+release_image_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהסרת השיוך של התמונה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהסרת השיוך של התמונה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

menu_items.post('/upload-related-item-image&:menu_item_id&:old_image_id', function(req, res){

    fs.rename('./includes/images/uploades/'+req.files.item_image_related.name, './includes/images/uploades/'+req.files.item_image_related.originalname, function(err) {
        if (err) throw err;
    });
    var menu_item_id = req.params.menu_item_id.split('=')[1];
    var old_image_id = req.params.old_image_id.split('=')[1];
    var query = 'INSERT INTO `images`(`image_name`) VALUES ("uploades/'+req.files.item_image_related.originalname+'");';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var new_image_id = result.insertId;
                    query = 'INSERT INTO `food_items_images`(`food_item_id`, `image_id`, `active`) VALUES ("'+menu_item_id+'","'+new_image_id+'","1");';
                    conn.query(query, function(err, result){
                        if(!err){
                            settings.inc_menu_stamp();
                            var query = 'UPDATE `food_items_images` SET `active`="0" WHERE `food_item_id`="'+menu_item_id+'" AND `image_id`="'+old_image_id+'";';
                            conn.query(query, function(err, result){
                                if(!err){
                                    res.send({status: true});
                                }
                                else{
                                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                    res.send({status: false, msg: 'הייתה בעיה בהעלאת התמונה, אנא נסה שוב מאוחר יותר'});
                                }
                            });
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בהעלאת התמונה, אנא נסה שוב מאוחר יותר'});
                        }
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהעלאת התמונה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהעלאת התמונה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

function delete_menu_item(res, menu_type_id, menu_item_id){
    var query = 'DELETE FROM `food_items` WHERE `id`="'+menu_item_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err) {
            conn.query(query, function (err, result) {
                if (!err) {
                    settings.inc_menu_stamp();
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