var express    = require('express');
var my_sql     = require('mysql');
var mysql      = express.Router();

mysql.MySql_Connection = my_sql.createPool({
    connectionLimit : 10,
    host     : 'sql3.freemysqlhosting.net',
    user     : 'sql377627',
    port	 : 3306,
    password : 'zQ8%yN8*',
    database : 'sql377627'
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