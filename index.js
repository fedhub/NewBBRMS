var express    = require("express");
var app        = express();
var server     = require('http').createServer(app);
//var io         = require('socket.io').listen(server);
var path       = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
app.use(multer({ dest: './includes/images/uploades'}));


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

//app.use(multer({ dest: './includes/uploades'}));
//app.use(require('multer'));

// define routes
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

//function getFiles (dir, files_){
//    files_ = files_ || [];
//    var files = fs.readdirSync(dir);
//    for (var i in files){
//        var name = dir + '/' + files[i];
//        if (fs.statSync(name).isDirectory()){
//            getFiles(name, files_);
//        } else {
//            files_.push(name);
//        }
//    }
//    return files_;
//}
//
//
////var files = getFiles('includes/images');
////var files_name = [];
////for(var i = 0; i < files.length; i++){
////    files_name.push(files[i].split('/')[2]);
////}
////for(var j = 0; j < files_name.length; j++){
////    console.log(j + ' : ' +files_name[j]);
////}
////
////mysql.getConnection(function(err, conn){
////    for(var j = 0; j < files_name.length; j++){
////        if(files_name[0] == 's' || files_name[0] == 't' || files_name[0] == 'v' || files_name[0] == 'w')
////                run_query(conn, files_name[j]);
////    }
////});
//
//
//
//function run_query(conn, image_name){
//    var query = 'INSERT INTO `images`(`image_name`) VALUES ("'+image_name+'");';
//    conn.query(query, function(err, result){});
//}

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
app.use(require('./menu-types'));
app.use(require('./menu-items'));
app.use(require('./menu-additions'));
app.use(require('./addition-types'));
app.use(require('./business-customers'));

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