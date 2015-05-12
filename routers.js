var express    = require('express');
var router     = express.Router();
var functions  = require('./functions');
var settings = require('./settings');

router.get('/', function(req, res){
    var breadcrumbs = [{path: '#', name: 'דף הבית'}];
    res.render('index', {
        username: settings.get_username(),
        breadcrumbs: breadcrumbs
    });
});

module.exports = router;