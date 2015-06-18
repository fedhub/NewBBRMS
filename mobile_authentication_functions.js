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
                        "('" + mysql_real_escape_string(first_name) + "', '" + mysql_real_escape_string(last_name) + "', '" + phone_number + "', '" + email + "', '" + mysql_real_escape_string(street) + "', '" + house_number + "', '" + floor + "', '" + enter + "');";
                        conn.query(query, function(err, result){
                            if(!err) res.send(true);
                            else console.log("There was an error with MySQL Query: " + query + ' ' + err);
                        });
                    }
                    // phone_number already subscribed
                    else res.send(false);
                }
                else console.log("There was an error with MySQL Query: " + query + ' ' + err);
                conn.release();
            });
        }
        else{console.log(err);}
    });

};

mobile_authentication_functions.log_in_private = function(req, res){

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
                conn.release();
            });
        }
        else{console.log(err);}
    });

};

mobile_authentication_functions.log_in_business = function(req, res){

    var customer_details = JSON.parse(req.body.data);
    var phone_number = customer_details.phone_number;
    var password = customer_details.password;

    var query = "SELECT COUNT(id) AS val FROM `business_customers` WHERE `phone_number`='"+phone_number+"';";
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0) {
                        query = "SELECT COUNT(id) AS val FROM `business_customers` WHERE `phone_number`='"+phone_number+"' AND `password`='"+password+"';";
                        conn.query(query, function(err, result){
                            if(!err){
                                if(result[0].val > 0){
                                    query = "SELECT * FROM `business_customers` WHERE `phone_number`='"+phone_number+"' AND `password`='"+password+"';";
                                    conn.query(query, function(err, result){
                                        if(!err){
                                            res.send(result[0]);
                                        }
                                        else{
                                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                        }
                                    });
                                }
                                else res.send('password-not-match');
                            }
                            else console.log("There was an error with MySQL Query: " + query + ' ' + err);
                        });
                    }
                    // phone_number is not subscribed
                    else res.send('phone-not-exist');
                }
                else console.log("There was an error with MySQL Query: " + query + ' ' + err);
                conn.release();
            });
        }
        else{console.log(err);}
    });

};

mobile_authentication_functions.update_customer_phone_same = function(req, res){

    var customer_type = req.params.customer_type.split('=')[1];
    var customer_details = JSON.parse(req.body.data);
    var table = '';
    if(customer_type == 'business') table = 'business_customers';
    if(customer_type == 'private') table = 'private_customers';
    var query = 'UPDATE `'+table+'` SET `first_name`="'+mysql_real_escape_string(customer_details.first_name)+'",`last_name`="'+mysql_real_escape_string(customer_details.last_name)+'",`email`="'+customer_details.email+'",`street`="'+mysql_real_escape_string(customer_details.street)+'",`house_number`="'+customer_details.house_number+'",`floor`="'+customer_details.floor+'",`enter`="'+customer_details.enter+'",`password`="'+customer_details.password+'" WHERE `phone_number`="'+customer_details.phone_number+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
        }
    });

};

mobile_authentication_functions.update_customer_phone_changed = function(req, res){

    var customer_type = req.params.customer_type.split('=')[1];
    var customer_details = JSON.parse(req.body.data);
    var query = 'SELECT COUNT(id) AS val FROM `business_customers` WHERE `phone_number`="'+customer_details.phone_number+'";';
     mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        res.send({status: false, msg: 'מספר הטלפון החדש שהזנת כבר קיים במערכת, עדכון הפרטים נכשל'});
                    }
                    else{
                        query = 'SELECT COUNT(id) AS val FROM `private_customers` WHERE `phone_number`="'+customer_details.phone_number+'";';
                        conn.query(query, function(err, result){
                            if(!err){
                                if(result[0].val > 0){
                                    res.send({status: false, msg: 'מספר הטלפון החדש שהזנת כבר קיים במערכת, עדכון הפרטים נכשל'});
                                }
                                else{
                                    if(customer_type == 'business') query = 'UPDATE `business_customers` SET `first_name`="'+customer_details.first_name+'",`last_name`="'+customer_details.last_name+'",`phone_number`="'+customer_details.phone_number+'",`email`="'+customer_details.email+'",`street`="'+mysql_real_escape_string(customer_details.street)+'",`house_number`="'+customer_details.house_number+'",`floor`="'+customer_details.floor+'",`enter`="'+customer_details.enter+'",`password`="'+customer_details.password+'" WHERE `phone_number`="'+customer_details.old_phone_number+'";';
                                    if(customer_type == 'private') query = 'UPDATE `private_customers` SET `first_name`="'+customer_details.first_name+'",`last_name`="'+customer_details.last_name+'",`phone_number`="'+customer_details.phone_number+'",`email`="'+customer_details.email+'",`street`="'+mysql_real_escape_string(customer_details.street)+'",`house_number`="'+customer_details.house_number+'",`floor`="'+customer_details.floor+'",`enter`="'+customer_details.enter+'" WHERE `phone_number`="'+customer_details.old_phone_number+'";';
                                    conn.query(query, function(err, result){
                                        if(!err){
                                            if(customer_type == 'business') query = 'SELECT COUNT(id) AS val FROM `private_customers` WHERE `phone_number`="'+customer_details.old_phone_number+'";';
                                            if(customer_type == 'private') query = 'SELECT COUNT(id) AS val FROM `business_customers` WHERE `phone_number`="'+customer_details.old_phone_number+'";';
                                            conn.query(query, function(err, result){
                                                if(!err){
                                                    if(result[0].val > 0){
                                                        if(customer_type == 'business') query = 'UPDATE `private_customers` SET `phone_number`="'+customer_details.phone_number+'" WHERE `phone_number`="'+customer_details.old_phone_number+'";';
                                                        if(customer_type == 'private') query = 'UPDATE `business_customers` SET `phone_number`="'+customer_details.phone_number+'" WHERE `phone_number`="'+customer_details.old_phone_number+'";';
                                                        conn.query(query, function(err, result){
                                                            if(!err){
                                                                update_last_orders(customer_details, res);
                                                            }
                                                            else{
                                                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                                                res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                                                            }
                                                        });
                                                    }
                                                    else{
                                                        update_last_orders(customer_details, res);
                                                    }
                                                }
                                                else{
                                                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                                                }
                                            });
                                        }
                                        else{
                                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                                        }
                                    });
                                }
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
        }
    });

};

function update_last_orders(customer_details, res){
    var query = 'SELECT COUNT(id) AS val FROM `last_orders` WHERE `phone_number`="'+customer_details.old_phone_number+'";';
    mysql.getConnection(function(err, conn){
       if(!err){
           conn.query(query, function(err, result){
               if(!err){
                   if(result[0].val > 0){
                       query = 'UPDATE `last_orders` SET `phone_number`="'+customer_details.phone_number+'" WHERE `phone_number`="' + customer_details.old_phone_number + '";';
                       conn.query(query, function(err, result){
                           if(!err){
                               update_order_libraries(customer_details, res);
                           }
                           else{
                               console.log("There was an error with MySQL Query: " + query + ' ' + err);
                               res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                           }
                       });
                   }
                   else{
                       update_order_libraries(customer_details, res);
                   }
               }
               else{
                   console.log("There was an error with MySQL Query: " + query + ' ' + err);
                   res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
               }
               conn.release();
           });
       }
        else{
           res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
       }
    });
}

function update_order_libraries(customer_details, res){
    var query = 'SELECT COUNT(id) AS val FROM `order_libraries` WHERE `phone_number`="'+customer_details.old_phone_number+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'UPDATE `order_libraries` SET `phone_number`="'+customer_details.phone_number+'" WHERE `phone_number`="' + customer_details.old_phone_number + '";';
                        conn.query(query, function(err, result){
                            if(!err){
                                update_library_items(customer_details, res);
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                    else{
                        update_library_items(customer_details, res);
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
        }
    });
}

function update_library_items(customer_details, res){
    var query = 'SELECT COUNT(id) AS val FROM `library_items` WHERE `phone_number`="'+customer_details.old_phone_number+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'UPDATE `library_items` SET `phone_number`="'+customer_details.phone_number+'" WHERE `phone_number`="' + customer_details.old_phone_number + '";';
                        conn.query(query, function(err, result){
                            if(!err){
                                update_business_budgets(customer_details, res);
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                    else{
                        update_business_budgets(customer_details, res);
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
        }
    });
}

function update_business_budgets(customer_details, res){
    var query = 'SELECT COUNT(id) AS val FROM `business_budgets` WHERE `phone_number`="'+customer_details.old_phone_number+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'UPDATE `business_budgets` SET `phone_number`="'+customer_details.phone_number+'" WHERE `phone_number`="' + customer_details.old_phone_number + '";';
                        conn.query(query, function(err, result){
                            if(!err){
                                update_business_companies(customer_details, res);
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                    else{
                        update_business_companies(customer_details, res);
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
        }
    });
}

function update_business_companies(customer_details, res){
    var query = 'SELECT COUNT(id) AS val FROM `business_companies` WHERE `representative`="'+customer_details.old_phone_number+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'UPDATE `business_companies` SET `representative`="'+customer_details.phone_number+'" WHERE `representative`="' + customer_details.old_phone_number + '";';
                        conn.query(query, function(err, result){
                            if(!err){
                                res.send({status: true});
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                    else{
                        res.send({status: true});
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון הפרטים האישיים, אנא נסה שוב מאוחר יותר'});
        }
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

module.exports = mobile_authentication_functions;



















