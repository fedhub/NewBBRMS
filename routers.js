var express    = require('express');
var router     = express.Router();
var functions  = require('./functions');
var settings = require('./settings');

router.get('/', function(req, res){
    res.render('index', {
        username: settings.get_username()
    });
});

module.exports = router;