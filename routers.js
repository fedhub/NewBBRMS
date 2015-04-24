var express    = require('express');
var router     = express.Router();
var functions  = require('./functions');


router.get('/', function(req, res){
    res.render('index');
});


module.exports = router;