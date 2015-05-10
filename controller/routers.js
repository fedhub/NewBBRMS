var express    = require('express');
var router     = express.Router();
var functions  = require('../model/functions');


router.get('/', function(req, res){
    res.render('index');
});


module.exports = router;