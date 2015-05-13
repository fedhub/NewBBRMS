var express = require('express');
var authentication = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

authentication.post('/authenticate', function(req, res, next){

    var user_details = JSON.parse(req.body.data);
    var username = user_details.username;
    var password = user_details.password;

    var query = 'SELECT COUNT(id) AS val FROM `managers` WHERE `username`="'+username+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'SELECT * FROM `managers` WHERE `username`="'+username+'";';
                        conn.query(query, function(err, result){
                            if(!err){
                                if(result[0].password == password){
                                    settings.set_is_connected(true);
                                    if(result[0].admin) settings.set_is_admin(true);
                                    settings.set_manager(result[0]);
                                    res.send({status: true, result: result[0]});
                                }
                                else{
                                    res.send({status: false, msg: 'סיסמה לא נכונה'});
                                }
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בתהליך ההתחברות, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                    else{
                        res.send({status: false, msg: 'שם המשתמש אינו קיים במערכת'});
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך ההתחברות, אנא נסה שוב מאוחר יותר'});
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });

});

authentication.get('/authentication', function(req, res){

    settings.reset_sys();
    res.render('authentication');

});

authentication.get('/manager-details', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'},{path: '#', name: 'עדכון פרטים אישיים'}];
    var form_items = get_form_details();

    res.render('manager-details', {
        username: settings.get_username(),
        breadcrumbs: breadcrumbs,
        form_items: form_items
    });

});

authentication.post('/update-manager-details', function(req, res){

    var manager = JSON.parse(req.body.data);
    var query = 'UPDATE `managers` SET ' +
        '`first_name`="'+manager.first_name+'",' +
        '`last_name`="'+manager.last_name+'",' +
        '`phone_number`="'+manager.phone_number+'",' +
        '`email`="'+manager.email+'",' +
        '`username`="'+manager.username+'",' +
        '`password`="'+manager.password+'" ' +
        'WHERE `id`="'+settings.get_manager_id()+'"';

    mysql.getConnection(function(err, conn) {
        if (!err) {
            conn.query(query, function (err, result) {
                if (!err) {
                    //res.send({status: true, msg: 'הפרטים עודכנו בהצלחה'});
                    query = 'SELECT * FROM `managers` WHERE `id`="' + settings.get_manager_id() + '"';
                    conn.query(query, function (err, result) {
                        if (!err) {
                            settings.set_manager(result[0]);
                            res.send({status: true, result: result[0]});
                        }
                        else {
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בתהליך עדכון הפרטים, אנא נסה שוב מאוחר יותר'});
                        }
                    });
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך עדכון הפרטים, אנא נסה שוב מאוחר יותר'});
                }
            });
            conn.release();
        }
        else {
            console.log(err);
        }
    });

});

function get_form_details(){
    var manager = settings.get_manager();
    return [
        {required: '*', type: 'text', label: 'שם פרטי:', max_length: 15, id: 'first-name', value: manager.first_name},
        {required: '*', type: 'text', label: 'שם משפחה:', max_length: 15, id: 'last-name', value: manager.last_name},
        {required: '*', type: 'text', label: 'טלפון:', max_length: 10, id: 'phone-number', value: manager.phone_number},
        {required: '*', type: 'text', label: 'דוא"ל:', max_length: 30, id: 'email', value: manager.email},
        {required: '*', type: 'text', label: 'שם משתמש:', max_length: 8, id: 'username', value: manager.username},
        {required: '*', type: 'password', label: 'סיסמה:', max_length: 15, id: 'password', value: manager.password}
    ];
}

//authentication.all('*', function(req, res, next){
//
//    var req_url = req.originalUrl;
//    if(settings.get_is_connected()
//        || req_url == '/authenticate')
//        //|| req_url == '/menu-types'
//        //|| req_url == '/menu-items&:food_type_id'
//        //|| req_url == '/menu-additions&:food_item_id'
//        //|| req_url == '/make-order'
//        //|| req_url == '/last-orders&:phone_number'
//        //|| req_url == '/new-library'
//        //|| req_url == '/get-libraries&:phone_number'
//        //|| req_url == '/library-items&:library_id'
//        //|| req_url == '/add-library-item'
//        //|| req_url == '/update-library'
//        //|| req_url == '/delete-from-library'
//        //|| req_url == '/delete-library'
//        //|| req_url == '/sign-up'
//        //|| req_url == '/log-in')
//        //|| req_url == '/ms-log-out')
//        next();
//
//    else if(!settings.get_is_connected()) res.render('authentication');
//
//});

module.exports = authentication;