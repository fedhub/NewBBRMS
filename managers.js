var express = require('express');
var managers = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

managers.get('/managers', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '/managers', name: 'מנהלים'}];
    var query = 'SELECT * FROM `managers`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('managers', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        msg: '',
                        managers: result
                    });
                }
                else{
                    res.status(404).render('error404')
                }
            });
        }
        else {console.log(err);}
    });

});

managers.post('/is-admin-check', function(req, res){

    console.log(settings.get_is_admin());

    if(settings.get_is_admin()) res.send(true);
    else res.send(false);

});


module.exports = managers;