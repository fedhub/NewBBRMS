var express                          = require('express');
var mobile_authentication_functions  = express.Router();
var mysql                            = require('./mysql');

mobile_authentication_functions.sign_up = function(req, res){

    var customer_details = JSON.parse(req.body.data);
    var first_name = customer_details.first_name;
    var last_name = customer_details.last_name;
    var phone_number = customer_details.phone_number;
    var email = customer_details.email;
    var street = customer_details.street;
    var house_number = customer_details.house_number;
    var floor = customer_details.floor;
    var enter = customer_details.enter;

    var query = "SELECT COUNT(id) AS val FROM `private_customers` WHERE phone_number='"+phone_number+"';";
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val == 0) {
                        query = "INSERT INTO `private_customers`" +
                        "(`first_name`, `last_name`, `phone_number`, `email`, `street`, `house_number`, `floor`, `enter`) " +
                        "VALUES " +
                        "('" + first_name + "', '" + last_name + "', '" + phone_number + "', '" + email + "', '" + [street] + "', '" + house_number + "', '" + floor + "', '" + enter + "');";
                        conn.query(query, function(err, result){
                            if(!err) res.send(true);
                            else console.log("There was an error with MySQL Query: " + query + ' ' + err);
                        });
                    }
                    // phone_number already subscribed
                    else res.send(false);
                }
                else console.log("There was an error with MySQL Query: " + query + ' ' + err);
            });
            conn.release();
        }
        else{console.log(err);}
    });

}

mobile_authentication_functions.log_in = function(req, res){

    var customer_details = JSON.parse(req.body.data);
    var first_name = customer_details.first_name;
    var phone_number = customer_details.phone_number;

    var query = "SELECT COUNT(id) AS val FROM `private_customers` WHERE phone_number='"+phone_number+"';";
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0) {
                        query = "SELECT * FROM `private_customers` WHERE phone_number='"+phone_number+"';";
                        conn.query(query, function(err, result){
                            if(!err){
                                if(result[0].first_name == first_name) res.send(result[0]);
                                else res.send('name-not-match');
                            }
                            else console.log("There was an error with MySQL Query: " + query + ' ' + err);
                        });
                    }
                    // phone_number is not subscribed
                    else res.send('phone-not-exist');
                }
                else console.log("There was an error with MySQL Query: " + query + ' ' + err);
            });
            conn.release();
        }
        else{console.log(err);}
    });

}

module.exports = mobile_authentication_functions;