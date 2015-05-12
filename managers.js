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
                    res.status(404).render('error404');
                }
            });
            conn.release();
        }
        else {console.log(err);}
    });

});

managers.post('/is-admin-check', function(req, res){

    if(settings.get_is_admin()) res.send(true);
    else res.send(false);

});

managers.get('/update-admin&:manager_id&:admin_state', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '/managers', name: 'מנהלים'}];
    var id = req.params.manager_id.split('=')[1];
    var state = req.params.admin_state.split('=')[1];

    var query = 'UPDATE `managers` SET `admin`="'+state+'" WHERE `id`="'+id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    query = 'SELECT * FROM `managers`;';
                    conn.query(query, function(err, result){
                        if(!err){
                            res.render('managers', {
                                username: settings.get_username(),
                                breadcrumbs: breadcrumbs,
                                managers: result
                            });
                        }
                        else{
                            res.status(404).render('error404');
                        }
                    });
                }
                else{
                    res.status(404).render('error404')
                }
            });
            conn.release();
        }
        else {console.log(err);}
    });

});

managers.get('/delete-manager&:manager_id', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '/managers', name: 'מנהלים'}];
    var id = req.params.manager_id.split('=')[1];
    var query = 'DELETE FROM `managers` WHERE `id`="'+id+'";';
    mysql.getConnection(function(err, conn){
        conn.query(query, function(err, result){
            if(!err){
                query = 'SELECT * FROM `managers`;';
                conn.query(query, function(err, result){
                    if(!err){
                        res.render('managers', {
                            username: settings.get_username(),
                            breadcrumbs: breadcrumbs,
                            managers: result
                        });
                    }
                    else{
                        res.status(404).render('error404');
                    }
                });
            }
            else{
                res.status(404).render('error404');
            }
        });
        conn.release();
    });

});

managers.post('/manager-id&:test_id', function(req, res){

    var my_id = settings.get_manager_id();
    var your_id = req.params.test_id.split('=')[1];
    if(my_id == your_id) res.send(true);
    else res.send(false);

});


module.exports = managers;