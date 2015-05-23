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
    "ai.seal, " +
    "i.image_name AS image ";
    query += "FROM addition_types at ";
    query += "LEFT JOIN food_items_additions fia ON at.id = fia.addition_type_id ";
    query += "LEFT JOIN addition_items ai ON at.id=ai.addition_type_id ";
    query += "LEFT JOIN addition_items_images aii ON ai.id = aii.addition_item_id AND aii.active='1' ";
    query += "LEFT JOIN images i ON aii.image_id=i.id ";
    query += "WHERE fia.food_item_id='"+menu_item_id+"';";

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
                conn.release();
            });
        }
        else{console.log(err);}
    });

});

menu_additions.post('/conceal-addition-item&:addition_type_id&:addition_item_id', function(req, res){

    var addition_item_id = req.params.addition_item_id.split('=')[1];
    var addition_type_id = req.params.addition_type_id.split('=')[1];
    var query = 'SELECT (SELECT COUNT(*) FROM `addition_items` WHERE `addition_type_id`="'+addition_type_id+'") AS tot_count, (SELECT COUNT(*) FROM `addition_items` WHERE `addition_type_id`="'+addition_type_id+'" AND `seal`="1") AS sealed_count;';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var tot_addition_items_count = result[0].tot_count;
                    var sealed_addition_items_count = result[0].sealed_count;
                    if((result[0].tot_count - result[0].sealed_count) >= 2){
                        query = 'SELECT * FROM `addition_types` WHERE `id`="'+addition_type_id+'";';
                        conn.query(query, function(err, result){
                            if(!err){
                                var msg = '';
                                if(result[0].selection_type == 'required_min'){
                                    if(result[0].selections_amount == (tot_addition_items_count - sealed_addition_items_count)){
                                        msg = 'אופן הבחירה שהגדרת עבור סט תוספות זה הוא בחירה של לפחות ';
                                        msg += result[0].selections_amount + ' ';
                                        msg += 'פריטים, באפשרותך לשנות את הגדרות הבחירה של סט תוספות זה';
                                        res.send({status: false, msg: msg});
                                    }
                                    else{
                                        conceal_addition_item(addition_item_id, res);
                                    }
                                }
                                if(result[0].selection_type == 'required_exact'){
                                    if(result[0].selections_amount == (tot_addition_items_count - sealed_addition_items_count)){
                                        msg = 'אופן הבחירה שהגדרת עבור סט תוספות זה הוא בחירה של בדיוק ';
                                        msg += result[0].selections_amount + ' ';
                                        msg += 'פריטים, באפשרותך לשנות את הגדרות הבחירה של סט תוספות זה';
                                        res.send({status: false, msg: msg});
                                    }
                                    else{
                                        conceal_addition_item(addition_item_id, res);
                                    }
                                }
                                if(result[0].selection_type == 'optional_max'){
                                    conceal_addition_item(addition_item_id, res);
                                }
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בעדכון ההסתרה של הפריט, אנא נסה שוב מאוחר יותר'});
                            }
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

menu_additions.post('/delete-addition-item&:addition_type_id&:addition_item_id', function(req, res){

    var addition_item_id = req.params.addition_item_id.split('=')[1];
    var addition_type_id = req.params.addition_type_id.split('=')[1];
    var query = 'SELECT (SELECT COUNT(*) FROM `addition_items` WHERE `addition_type_id`="'+addition_type_id+'") AS tot_addition_items_count, ' +
        '(SELECT COUNT(*) FROM `addition_items` WHERE `addition_type_id`="'+addition_type_id+'" AND `seal`="1") AS sealed_addition_items_count, ' +
        '(SELECT `seal` FROM `addition_items` WHERE `id`="'+addition_item_id+'") AS is_sealed, ' +
        '(SELECT `selection_type` FROM `addition_types` WHERE `id`="'+addition_type_id+'") AS selection_type, ' +
        '(SELECT `selections_amount` FROM `addition_types` WHERE `id`="'+addition_type_id+'") AS selections_amount;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result) {
                if(!err){
                    var tot_addition_items_count = result[0].tot_addition_items_count;
                    var sealed_addition_items_count = result[0].sealed_addition_items_count;
                    var is_sealed = result[0].is_sealed;
                    var selection_type = result[0].selection_type;
                    var selections_amount = result[0].selections_amount;
                    if((is_sealed == '1') ||
                        ((selection_type == 'required_exact' || selection_type == 'required_min') && (tot_addition_items_count - (sealed_addition_items_count + 1) >= selections_amount)) ||
                        (selection_type == 'optional_max')){
                        delete_addition_item(res, addition_item_id);
                    }
                    else{
                        var msg = 'המחיקה אסורה, ייתכן שמדובר בפריט האחרון שנותר בקטגוריה הזו';
                        msg += ' או שישנם פריטים אחרים שמוסתרים ולכן קיימת התנגשות עם הגרות הבחירה ';
                        msg += 'המוגדרות ללקוח עבור סט התוספות הזה';
                        res.send({status: false, msg: msg});
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך המחיקה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{console.log(err);}
    });

});

menu_additions.post('/reveal-addition-item&:addition_type_id&:addition_item_id', function(req, res){

    var addition_item_id = req.params.addition_item_id.split('=')[1];
    var addition_type_id = req.params.addition_type_id.split('=')[1];
    var query = 'UPDATE `addition_items` SET `seal`="0" WHERE `id`='+addition_item_id+';';
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

menu_additions.get('/edit-addition-item&:params', function(req, res){

    var params = req.params.params.split('=')[1];
    params = JSON.parse(params);
    var menu_type_id = params.menu_type_id;
    var menu_type_name = params.menu_type_name;
    var menu_item_id = params.menu_item_id;
    var menu_item_name = params.menu_item_name;
    var addition_item_name = params.addition_item_name;
    var addition_item_id = params.addition_item_id;
    var addition_item_price = params.addition_item_price;
    var addition_item_description = params.addition_item_description;

    var name = 'עריכת ';
    name += addition_item_name;
    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/menu-types', name: 'ניהול תפריט'},
        {path: '/menu-items&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name, name: menu_type_name},
        {path: '/menu-additions&menu_type_id='+menu_type_id+'&menu_type_name='+menu_type_name+'&menu_item_id='+menu_item_id+'&menu_item_name='+menu_item_name, name: menu_item_name},
        {path: '#', name: name}];

    var all_images = [];
    var related_images = [];
    var query = 'SELECT * FROM `images`';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    all_images = result;
                    query = "SELECT aii.addition_item_id, aii.image_id, aii.active, i.id, i.image_name " +
                    "FROM addition_items_images aii " +
                    "LEFT JOIN images i ON aii.image_id=i.id " +
                    "WHERE aii.addition_item_id='"+addition_item_id+"';";
                    conn.query(query, function(err, result){
                        if(!err){
                            var i = 0, j = 0;
                            related_images = result;
                            for(i = 0; i < all_images.length; i++){
                                for(j = 0; j < related_images.length; j++){
                                    if(all_images[i].id == related_images[j].image_id) all_images.splice(i, 1);
                                }
                            }
                            res.render('edit-addition-item', {
                                username: settings.get_username(),
                                breadcrumbs: breadcrumbs,
                                params: params,
                                related_images: related_images,
                                all_images: all_images
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

//menu_additions.post('/update-addition-item-image&:addition_item_id&:image_id', function(req, res){
//
//    var addition_item_id = req.params.addition_item_id.split('=')[1];
//    var image_id = req.params.image_id.split('=')[1];
//
//    var query = 'UPDATE `addition_items_images` SET `active`="0" WHERE `addition_item_id`='+addition_item_id;
//    mysql.getConnection(function(err, conn){
//        if(!err){
//            conn.query(query, function(err, result){
//                if(!err){
//                    query = 'INSERT INTO `addition_items_images`(`addition_item_id`, `image_id`, `active`) VALUES ("'+addition_item_id+'","'+image_id+'","1")';
//                    mysql.getConnection(function(err, conn){
//                        if(!err){
//                            conn.query(query, function(err, result){
//                                if(!err){
//                                    res.send({status: true});
//                                }
//                                else{
//                                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
//                                    res.send({status: false, msg: 'הייתה בעייה בהבאת הדף המבוקש, אנא נסה שוב מאוחר יותר'});
//                                }
//                                conn.release();
//                            });
//                        }
//                        else{
//                            res.send({status: false, msg: 'הייתה בעייה בהבאת הדף המבוקש, אנא נסה שוב מאוחר יותר'});
//                        }
//                    });
//                }
//                else{
//                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
//                    res.send({status: false, msg: 'הייתה בעייה בהבאת הדף המבוקש, אנא נסה שוב מאוחר יותר'});
//                }
//                conn.release();
//            });
//        }
//        else{
//            res.send({status: false, msg: 'הייתה בעייה בהבאת הדף המבוקש, אנא נסה שוב מאוחר יותר'});
//        }
//    });
//
//});

function conceal_addition_item(addition_item_id, res){
    var query = 'UPDATE `addition_items` SET `seal`="1" WHERE `id`='+addition_item_id+';';
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
                conn.release();
            });
        }
        else{console.log(err);}
    });
}

function delete_addition_item(res, addition_item_id){
    var query = 'DELETE FROM `addition_items` WHERE `id`='+addition_item_id+';';
    mysql.getConnection(function(err, conn){
        if(!err) {
            conn.query(query, function (err, result) {
                if (!err) {
                    query = 'DELETE FROM `addition_items_images` WHERE `addition_item_id`=' + addition_item_id + ';';
                    conn.query(query, function (err, result) {
                        if (!err) {
                            res.send({status: true, msg: ''});
                        }
                        else {
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בתהליך המחיקה, אנא נסה שוב מאוחר יותר'});
                        }
                    });
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך המחיקה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            console.log("There was an error with MySQL Query: " + query + ' ' + err);
            res.send({status: false, msg: 'הייתה בעיה בתהליך המחיקה, אנא נסה שוב מאוחר יותר'});
        }
    });
}

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
    this.seal = item.seal;
}

module.exports = menu_additions ;