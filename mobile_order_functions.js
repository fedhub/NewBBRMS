var express                 = require('express');
var mobile_order_functions  = express.Router();
var mysql                   = require('./mysql');

mobile_order_functions.make_order = function(req, res){

    var order_info_text = req.body.data;
    var order_info_obj = JSON.parse(order_info_text);
    order_info_obj.customer_details = JSON.parse(order_info_obj.customer_details);
    order_info_obj.my_cart = JSON.parse(order_info_obj.my_cart);

    var query = 'INSERT INTO `last_orders`(' +
        '`order_json`, ' +
        '`order_date`, ' +
        '`order_time`, ' +
        '`phone_number`) ' +
        'VALUES ("'+mysql_real_escape_string(order_info_text)+'","'+order_info_obj.order_date+'","'+order_info_obj.order_time+'","'+order_info_obj.customer_details.phone_number+'");';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send(true);
                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send(false);
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });

};

mobile_order_functions.last_orders = function(req, res){

    var phone_number = req.params.phone_number.split('=');
    phone_number = phone_number[phone_number.length - 1];

    var query = 'SELECT `order_json` FROM `last_orders` WHERE `phone_number`="'+phone_number+'";';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send(result);
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send(false);
                }
            });
            conn.release();
        }
        else{console.log(err);}
    });

};

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

module.exports = mobile_order_functions;