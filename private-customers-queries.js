var express = require('express');
var queries = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

queries.get('/private-customers-queries', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '/queries', name: 'שאילתות'}, {path: '#', name: 'לקוחות פרטיים'}];
    var query = 'SELECT * FROM `private_customers` ORDER BY `year`, `month`, `day`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('private-customers-queries', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        customers: fix_dates(result)
                    });
                }
                else{
                    res.send('404 not found');
                }
                conn.release();
            });
        }
        else {
            console.log(err);
            res.send('404 not found');
        }
    });

});

queries.post('/get-libraries-phones', function(req, res){

    var query = 'SELECT `phone_number` FROM `order_libraries` GROUP BY `phone_number`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true, phones: result, sum: 0});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהבאת המידע המבוקש, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהבאת המידע המבוקש, אנא נסה שוב מאוחר יותר'});
        }
    });

});

queries.post('/get-most-libraries', function(req, res){

    var query = 'SELECT `phone_number`, COUNT(phone_number) AS sum FROM `order_libraries` GROUP BY `phone_number` ORDER BY sum DESC LIMIT 1;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true, phones: [{phone_number: result[0].phone_number}], sum: result[0].sum});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהבאת המידע המבוקש, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהבאת המידע המבוקש, אנא נסה שוב מאוחר יותר'});
        }
    });

});

queries.post('/libraries-by-phone&:phone_number', function(req, res){

    var phone_number = req.params.phone_number.split('=')[1];
    var query = 'SELECT COUNT(`phone_number`) AS sum FROM `order_libraries` WHERE `phone_number`="'+phone_number+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true, phones: [{phone_number: phone_number}], sum: result[0].sum});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהבאת המידע המבוקש, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהבאת המידע המבוקש, אנא נסה שוב מאוחר יותר'});
        }
    });

});

function fix_dates(result){
    for(var i = 0; i < result.length; i++){
        result[i].day = add_zero_before(result[i].day);
        result[i].month = add_zero_before(result[i].month);
    }
    return result;
}

function add_zero_before(i) {
    if (i < 10) {i = "0" + i}  // add zero in front of numbers < 10
    return i;
}

module.exports = queries;