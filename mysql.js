var express    = require('express');
var my_sql     = require('mysql');
var mysql      = express.Router();

mysql.MySql_Connection = my_sql.createPool({
    connectionLimit : 4,
    host     : '127.0.0.1',
    user     : 'root',
    port	 : 3306,
    //password : '54c23032',
    database : 'best_biss'
});

mysql.getConnection = function(callback){
    mysql.MySql_Connection.getConnection(function(err, conn){
        if(err){
            return callback(err);
        }
        callback(err, conn);
    });
};

module.exports = mysql;
