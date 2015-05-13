var express    = require("express");
var app        = express();
var server     = require('http').createServer(app);
//var io         = require('socket.io').listen(server);
var path       = require('path');
var bodyParser = require('body-parser');
var settings = require('settings');

// socket.io
/*io.sockets.on('connection', function(socket){

    socket.on('communicate', function(info){
        var socket_id = socket.id;
        io.emit('new-order-arrived', info);
    });

});*/

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// use middleware
app.use(express.static(path.join(__dirname, 'includes')));
app.use(bodyParser.urlencoded({ extended: false }));

// define routes

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next()
});
app.all('*', function(req, res, next){

    var req_url = req.originalUrl;
    if(settings.get_is_connected()
        || req_url == '/authenticate')
        //|| req_url == '/menu-types'
        //|| req_url == '/menu-items&:food_type_id'
        //|| req_url == '/menu-additions&:food_item_id'
        //|| req_url == '/make-order'
        //|| req_url == '/last-orders&:phone_number'
        //|| req_url == '/new-library'
        //|| req_url == '/get-libraries&:phone_number'
        //|| req_url == '/library-items&:library_id'
        //|| req_url == '/add-library-item'
        //|| req_url == '/update-library'
        //|| req_url == '/delete-from-library'
        //|| req_url == '/delete-library'
        //|| req_url == '/sign-up'
        //|| req_url == '/log-in')
        //|| req_url == '/ms-log-out')
        next();

    else if(!settings.get_is_connected()) res.render('authentication');

});

app.use(require('./mysql'));
app.use(require('./mobile_authentication_routers'));
app.use(require('./mobile_menu_routers'));
app.use(require('./mobile_order_routers'));
app.use(require('./mobile_authentication_functions'));
app.use(require('./mobile_menu_functions'));
app.use(require('./mobile_order_functions'));
app.use(require('./authentication'));
app.use(require('./routers'));
app.use(require('./functions'));
app.use(require('./managers'));

//app.use(require('./authentication'));
//app.use(require('./routers'));
//app.use(require('./mysql'));
//app.use(require('./mobile_authentication_routers'));
//app.use(require('./mobile_menu_routers'));
//app.use(require('./mobile_order_routers'));
//app.use(require('./functions'));
//app.use(require('./mobile_authentication_functions'));
//app.use(require('./mobile_menu_functions'));
//app.use(require('./mobile_order_functions'));
//app.use(require('./managers'));

var port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log("app http ready on port "+port);
});