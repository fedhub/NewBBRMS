var express    = require('express');
var my_sql     = require('mysql');
var mysql      = express.Router();

mysql.MySql_Connection = my_sql.createPool({
    connectionLimit : 10,
    host     : 'sql3.freemysqlhosting.net',
    user     : 'sql377201',
    port	 : 3306,
    password : 'zL1%fZ6!',
    database : 'sql377201'
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
