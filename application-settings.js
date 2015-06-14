var express = require('express');
var app_settings = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

app_settings.post('/get-closing-time', function(req, res){

    var query = 'SELECT `closing_hour`, `closing_minutes` FROM `application_settings` WHERE `id`="1";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                var closing_time = {hour: result[0].closing_hour, minutes: result[0].closing_minutes};
                if(!err){
                    res.send({status: true, closing_time: closing_time});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהבאת שעת הסגירה של החנות'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהבאת שעת הסגירה של החנות'});
        }
    })

});

app_settings.post('/get-working-hours', function(req, res){

    var query = 'SELECT `opening_hour`, `opening_minutes`, `closing_hour`, `closing_minutes` FROM `application_settings` WHERE `id`="1";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                var working_time = {
                    open_hour: result[0].opening_hour,
                    open_minutes: result[0].opening_minutes,
                    close_hour: result[0].closing_hour,
                    close_minutes: result[0].closing_minutes
                };
                if(!err){
                    res.send({status: true, working_time: working_time});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'לקוח יקר, אירעה תקלה בתהליך ההזמנה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'לקוח יקר, אירעה תקלה בתהליך ההזמנה, אנא נסה שוב מאוחר יותר'});
        }
    })

});

app_settings.get('/application-settings', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '#', name: 'הגדרות אפליקצייה'}];
    var query = 'SELECT * FROM `application_settings`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('application-settings', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        opening_hour: stringify_time_param(result[0].opening_hour),
                        opening_minutes: stringify_time_param(result[0].opening_minutes),
                        closing_hour: stringify_time_param(result[0].closing_hour),
                        closing_minutes: stringify_time_param(result[0].closing_minutes),
                        hours_arr: get_hours_arr(),
                        minutes_arr: get_minutes_arr(),
                        sit_allowed: result[0].sit_allowed,
                        delivery_allowed: result[0].delivery_allowed,
                        take_away_allowed: result[0].take_away_allowed
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send('404 not found');
                }
                conn.release();
            });
        }
        else{
            res.send('404 not found');
        }
    });

});

app_settings.post('/set-application-settings', function(req, res){

    var sets = JSON.parse(req.body.data);
    var query = 'UPDATE `application_settings` SET ' +
        '`opening_hour`="'+sets.open_hour+'",' +
        '`opening_minutes`="'+sets.open_minutes+'",' +
        '`closing_hour`="'+sets.close_hour+'",' +
        '`closing_minutes`="'+sets.close_minutes+'",' +
        '`sit_allowed`="'+sets.sit+'",' +
        '`delivery_allowed`="'+sets.delivery+'",' +
        '`take_away_allowed`="'+sets.take_away+'" ' +
        'WHERE `id`="1";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הגדרות האפליקציה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הגדרות האפליקציה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

app_settings.post('/get-order-type-settings', function(req, res){

    var query = 'SELECT `delivery_allowed`, `sit_allowed`, `take_away_allowed` FROM `application_settings` WHERE `id`="1";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true, result: result[0]});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'אירעה תקלה בתהליך ההזמנה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'אירעה תקלה בתהליך ההזמנה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

function stringify_time_param(time_param){
    if(time_param < 10) return '0'+time_param;
    return time_param;
}

function get_hours_arr(){
    var hours_arr = [];
    var hour = '';
    for(var i = 0; i < 24; i++){
        if(i < 10) hour = '0'+i;
        else hour = i;
        hours_arr.push(hour);
    }
    return hours_arr;
}

function get_minutes_arr(){
    var minutes_arr = [];
    var minutes = '';
    for(var i = 0; i < 56; i++){
        if(i % 5 == 0){
            if(i < 10) minutes = '0'+i;
            else minutes = i;
            minutes_arr.push(minutes);
        }
    }
    return minutes_arr;
}

module.exports = app_settings;