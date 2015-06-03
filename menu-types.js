var express = require('express');
var menu_types = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');
var fs = require('fs');

menu_types.get('/menu-types', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '#', name: 'ניהול תפריט'}];
    var query = '';
    query += "SELECT ft.id, ft.name, ft.seal, i.image_name ";
    query += "FROM food_types ft ";
    query += "LEFT JOIN food_types_images fti ON ft.id = fti.food_type_id ";
    query += "LEFT JOIN images i ON fti.image_id = i.id ";
    query += "WHERE fti.active='1';";

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
                conn.release();
            });
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
                conn.release();
            });
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
                conn.release();
            });
        }
        else{console.log(err);}
    });

});

menu_types.post('/delete-menu-type&:menu_type_id', function(req, res){

    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var query = 'SELECT (SELECT COUNT(*) FROM `food_types`) AS tot_menu_types_count, ' +
        '(SELECT COUNT(*) FROM `food_types` WHERE `seal`="1") AS sealed_menu_types_count, ' +
        '(SELECT `seal` FROM `food_types` WHERE `id`="'+menu_type_id+'") AS is_sealed;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var tot_menu_types_count = result[0].tot_menu_types_count;
                    var sealed_menu_types_count = result[0].sealed_menu_types_count;
                    var is_sealed = result[0].is_sealed;
                    if((is_sealed) || ((tot_menu_types_count - sealed_menu_types_count) >= 2)) delete_process_menu_type(res, menu_type_id);
                    else{
                        var msg = 'המחיקה אסורה, ייתכן שמדובר בסוג התפריט היחיד שקיים ';
                        msg += 'או בסוג התפריט היחיד שאינו מוסתר ללקוח';
                        res.send({status: false, msg: msg});
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            console.log("There was an error with MySQL Query: " + query + ' ' + err);
            res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'});
        }
    });

});

function delete_process_menu_type(res, menu_type_id){
    var query = 'DELETE FROM `food_types` WHERE `id`="'+menu_type_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err) {
            conn.query(query, function (err, result) {
                if (!err) {
                    query = 'DELETE FROM `food_types_images` WHERE `food_type_id`="' + menu_type_id + '"';
                    conn.query(query, function (err, result) {
                        if (!err) {
                            query = 'SELECT `id` FROM `food_items` WHERE `food_type_id`="' + menu_type_id + '";';
                            conn.query(query, function (err, result) {
                                if (!err) {
                                    var food_items_id_arr = result;
                                    query = 'DELETE FROM `food_items` WHERE `food_type_id`="' + menu_type_id + '";';
                                    conn.query(query, function (err, result) {
                                        if (!err) {
                                            food_items_deletion_handler(res, menu_type_id, food_items_id_arr);
                                        }
                                        else {
                                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                            res.send({
                                                status: false,
                                                msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'
                                            });
                                        }
                                    });
                                }
                                else {
                                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                    res.send({
                                        status: false,
                                        msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'
                                    });
                                }
                            });
                        }
                        else {
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'});
                        }
                    });
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            console.log("There was an error with MySQL Query: " + query + ' ' + err);
            res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'});
        }
    });
}

menu_types.get('/add-menu-type-page', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '#', name: 'הוספת תפריט חדש'}];
    res.render('add-menu-type', {
        username: settings.get_username(),
        breadcrumbs: breadcrumbs
    });

});

menu_types.post('/add-menu-type', function(req, res){

// addition_type_name, addition_type_description, selection_type,
// selections_amount, addition_item_name, addition_item_price,
// addition_item_description, menu_item_name, menu_item_price, menu_item_description,
// menu_type_name
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
                            query = 'INSERT INTO `addition_items_images`(`addition_item_id`, `image_id`, `active`) VALUES ("'+addition_item_id+'","55","1");';
                            conn.query(query, function(err, result){
                                if(!err){
                                    query = 'INSERT INTO `food_types`(`name`) VALUES ("'+info.menu_type_name+'");';
                                    conn.query(query, function(err, result){
                                        if(!err){
                                            var menu_type_id = result.insertId;
                                            query = 'INSERT INTO `food_types_images`(`food_type_id`, `image_id`, `active`) VALUES ("'+menu_type_id+'","55","1")';
                                            conn.query(query, function(err, result){
                                                if(!err){
                                                    query = 'INSERT INTO `food_items`(`food_type_id`, `name`, `description`, `price`) VALUES ("'+menu_type_id+'","'+info.menu_item_name+'","'+info.menu_item_description+'","'+info.menu_item_price+'")';
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

menu_types.get('/edit-menu-type&:params', function(req, res){

    var params = req.params.params.split('=')[1];
    params = JSON.parse(params);
    var menu_type_id = params.menu_type_id;
    var menu_type_name = params.menu_type_name;
    var name = 'עריכת ';
    name += menu_type_name;
    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '/menu-types', name: 'ניהול תפריט'}, {path: '#', name: name}];

    var all_images = [];
    var related_images = [];
    var query = 'SELECT * FROM `images`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    all_images = result;
                    query = "SELECT fti.food_type_id, fti.image_id, fti.active, i.id, i.image_name " +
                    "FROM food_types_images fti " +
                    "LEFT JOIN images i ON fti.image_id=i.id " +
                    "WHERE fti.food_type_id='"+menu_type_id+"';";
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
                            res.render('edit-menu-type', {
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

menu_types.post('/update-menu-type-details', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_type_id = info.menu_type_id;
    var name = info.name;
    var query = 'UPDATE `food_types` SET `name`="'+name+'" WHERE `id`="'+menu_type_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
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

menu_types.post('/switch-type-related-image-selected', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_type_id = info.menu_type_id;
    var old_image_id = info.old_image_id;
    var new_image_id = info.new_image_id;

    var query = 'UPDATE `food_types_images` fti1 JOIN `food_types_images` fti2 ' +
        'ON fti1.food_type_id="'+menu_type_id+'" AND fti1.image_id="'+old_image_id+'" AND fti2.food_type_id="'+menu_type_id+'" AND fti2.image_id="'+new_image_id+'" ' +
        'SET fti1.active="0", ' +
        'fti2.active="1";';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
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

menu_types.post('/switch-type-stock-image-selected', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_type_id = info.menu_type_id;
    var old_image_id = info.old_image_id;
    var new_image_id = info.new_image_id;

    var query = 'UPDATE `food_types_images` SET `active`="0" WHERE `food_type_id`="'+menu_type_id+'" AND `image_id`="'+old_image_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    query = 'INSERT INTO `food_types_images`(`food_type_id`, `image_id`, `active`) VALUES ("'+menu_type_id+'","'+new_image_id+'","1");';
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

menu_types.post('/release-type-related-image', function(req, res){

    var info = JSON.parse(req.body.data);
    var menu_type_id = info.menu_type_id;
    var release_image_id = info.release_image_id;

    var query = 'DELETE FROM `food_types_images` WHERE `food_type_id`="'+menu_type_id+'" AND `image_id`="'+release_image_id+'";';
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

menu_types.post('/upload-related-type-image&:menu_type_id&:old_image_id', function(req, res){

    fs.rename('./includes/images/uploades/'+req.files.type_image_related.name, './includes/images/uploades/'+req.files.type_image_related.originalname, function(err) {
        if (err) throw err;
    });
    var menu_type_id = req.params.menu_type_id.split('=')[1];
    var old_image_id = req.params.old_image_id.split('=')[1];
    var query = 'INSERT INTO `images`(`image_name`) VALUES ("uploades/'+req.files.type_image_related.originalname+'");';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var new_image_id = result.insertId;
                    query = 'INSERT INTO `food_types_images`(`food_type_id`, `image_id`, `active`) VALUES ("'+menu_type_id+'","'+new_image_id+'","1");';
                    conn.query(query, function(err, result){
                        if(!err){
                            var query = 'UPDATE `food_types_images` SET `active`="0" WHERE `food_type_id`="'+menu_type_id+'" AND `image_id`="'+old_image_id+'";';
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

function food_items_deletion_handler(res, menu_type_id, food_items_id_arr){
    var i = 0;
    mysql.getConnection(function(err, conn){
        if(!err){
            for(i = 0; i < food_items_id_arr.length; i++){
                run_query(conn, food_items_id_arr[i].id);
            }
            conn.release();
            res.send({status: true, msg: ''});
        }
        else{
            console.log("There was an error with MySQL Query: " + query + ' ' + err);
            res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הפריט, אנא נסה שוב מאוחר יותר'});
        }
    });
}

function run_query(conn, menu_item_id){
    var query = 'DELETE FROM `food_items_additions` WHERE `food_item_id`="'+menu_item_id+'";';
    conn.query(query, function(err, result){
        query = 'DELETE FROM `food_items_images` WHERE `food_item_id`="'+menu_item_id+'";';
        conn.query(query, function(err, result){});
    });
}

module.exports = menu_types;