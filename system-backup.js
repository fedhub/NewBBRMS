var express = require('express');
var backup = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');
var fs = require('fs');
var exec = require('child_process').exec;

backup.get('/backup', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'}, {path: '#', name: 'גיבוי נתונים'}];
    var query = 'SELECT * FROM `backups`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var backups = result;
                    res.render('backup', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        backups: backups
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send('404 not found');
                }
                conn.release();
            });
        }
        else{
            res.send('404 not found');
        }
    });

});

backup.post('/create-backup', function(req, res){

    var query = 'SELECT COUNT(id) AS val FROM `backups`;';
    var file_name = '';
    var dump = '';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'SELECT MAX(id) AS max_id FROM `backups`;';
                        conn.query(query, function(err, result){
                            if(!err){
                                file_name = 'backup' + (result[0].max_id + 1) + '.sql';
                                dump = 'mysqldump --lock-tables=false --user=sql377627 --password=zQ8%yN8* -h sql3.freemysqlhosting.net sql377627 > backups/' + file_name;
                                execute_dump(res, dump, file_name);
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בתהליך הגיבוי, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                    else{
                        file_name = 'backup' + 1 + '.sql';
                        dump = 'mysqldump --lock-tables=false --user=sql377627 --password=zQ8%yN8* -h sql3.freemysqlhosting.net sql377627 > backups/' + file_name;
                        execute_dump(res, dump, file_name);
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך הגיבוי, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בתהליך הגיבוי, אנא נסה שוב מאוחר יותר'});
        }
    });

});

backup.post('/update-backup-details', function(req, res){

    var details = JSON.parse(req.body.data);
    var query = 'UPDATE `backups` SET `name`="'+mysql_real_escape_string(details.new_name)+'",`description`="'+mysql_real_escape_string(details.new_description)+'" WHERE `id`="'+details.backup_id+'"';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים, אנא נסה שוב מאוחר יותר'});
        }
    });

});

backup.get('/download-backup-file&:file_name', function(req, res){

    var file_name = req.params.file_name.split('=')[1];
    var file = 'backups/'+file_name;
    res.download(file); // Set disposition and send it.

});

backup.post('/delete-backup', function(req, res){

    var details = JSON.parse(req.body.data);
    var query = 'DELETE FROM `backups` WHERE `id`="'+details.backup_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var filePath = 'backups/'+details.file_name;
                    fs.unlinkSync(filePath);
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הגיבוי, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בתהליך מחיקת הגיבוי, אנא נסה שוב מאוחר יותר'});
        }
    });

});

function execute_dump(res, dump, file_name){
    exec(dump, function(status, output) {
        //console.log('Exit status:', status);
        //console.log('Program output:', output);
        var date = new Date();
        var query = 'INSERT INTO `backups`(`day`, `month`, `year`, `hour`, `minutes`, `file_name`) ' +
            'VALUES (' +
            '"'+date.getDate()+'",' +
            '"'+(date.getMonth()+1)+'",' +
            '"'+date.getFullYear()+'",' +
            '"'+date.getHours()+'",' +
            '"'+date.getMinutes()+'",' +
            '"'+file_name+'");';
        mysql.getConnection(function(err, conn){
            if(!err){
                conn.query(query, function(err, result){
                    if(!err){
                        res.send({status: true});
                    }
                    else{
                        console.log("There was an error with MySQL Query: " + query + ' ' + err);
                        res.send({status: false, msg: 'הייתה בעיה בתהליך הגיבוי, אנא נסה שוב מאוחר יותר'});
                    }
                    conn.release();
                });
            }
            else{
                res.send({status: false, msg: 'הייתה בעיה בתהליך הגיבוי, אנא נסה שוב מאוחר יותר'});
            }
        });
    });
}

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}


module.exports = backup;