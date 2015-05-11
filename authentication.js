var express = require('express');
var authentication = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

authentication.all('*', function(req, res, next){

    var req_url = req.originalUrl;
    if(settings.get_is_connected()
        || req_url == '/authenticate'
        || req_url == '/ms-log-out') next();

    else if(!settings.get_is_connected()) res.render('authentication');

});

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


module.exports = authentication;