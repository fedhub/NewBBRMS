var express = require('express');
var queries = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

queries.get('/queries', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '#', name: 'שאילתות'}];
    res.render('queries', {
        username: settings.get_username(),
        breadcrumbs: breadcrumbs
    });

});

module.exports = queries;