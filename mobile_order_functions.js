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

mobile_order_functions.get_libraries = function(req, res){

    var phone_number = req.params.phone_number.split('=')[1];
    var query = 'SELECT COUNT(id) AS val FROM `order_libraries` WHERE `phone_number`="'+phone_number+'" AND `lock`="0";';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'SELECT * FROM `order_libraries` WHERE `phone_number`="'+phone_number+'" AND `lock`="0";';
                        conn.query(query, function(err, result){
                            if(!err){
                                res.send(result);
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send(false);
                            }
                        });
                    }
                    else res.send('empty');
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

mobile_order_functions.library_items = function(req, res){

    var library_id = req.params.library_id.split('=')[1];
    var query = "SELECT COUNT(id) AS val FROM `library_items` WHERE `library_id`='"+library_id+"';";

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'SELECT * FROM `library_items` WHERE `library_id`="'+library_id+'"';
                        conn.query(query, function(err, result){
                            if(!err){
                                res.send(result);
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send(false);
                            }
                        });
                    }
                    else res.send('empty');
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

mobile_order_functions.new_library = function(req, res){

    var lib_details = JSON.parse(req.body.data);
    var query = 'INSERT INTO `order_libraries`(' +
        '`phone_number`, ' +
        '`lib_name`, ' +
        '`lib_description`, ' +
        '`creation_date`, ' +
        '`creation_time`) ' +
        'VALUES (' +
        '"'+lib_details.phone_number+'",' +
        '"'+lib_details.lib_name+'",' +
        '"'+lib_details.lib_description+'",' +
        '"'+lib_details.creation_date+'",' +
        '"'+lib_details.creation_time+'");';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    query = 'SELECT * FROM `order_libraries` WHERE `phone_number`="'+lib_details.phone_number+'" AND `lock`="0";';
                    conn.query(query, function(err, result){
                        if(!err){
                            res.send(result);
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send(false);
                        }
                    });
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

// API -- sent from client (menu.js)
//var library_item_info = {
//    library_id: library.getLibraryID(),
//    creation_date: date.getFullDate(),
//    creation_time: date.getDefaultTime(),
//    phone_number: customer.getPhoneNumber(),
//    item_json: JSON.stringify(cart.getMyCart())
//};
mobile_order_functions.add_library_item = function(req, res){

    var library_item = JSON.parse(req.body.data);
    var query = 'INSERT INTO `library_items`(`library_id`, `creation_date`, `creation_time`, `phone_number`, `item_json`) ' +
        'VALUES ("'+library_item.library_id+'","'+library_item.creation_date+'","'+library_item.creation_time+'","'+library_item.phone_number+'","'+mysql_real_escape_string(library_item.item_json)+'");';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send(true);
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

mobile_order_functions.update_library = function(req, res){

    var lib_details = JSON.parse(req.body.data);
    var query = 'UPDATE `order_libraries` SET `lib_name`="'+lib_details.lib_name+'",`lib_description`="'+lib_details.lib_description+'" WHERE `id`="'+lib_details.lib_id+'";';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    query = 'SELECT * FROM `order_libraries` WHERE `phone_number`="'+lib_details.phone_number+'" AND `lock`="0";';
                    conn.query(query, function(err, result){
                        if(!err){
                            res.send(result);
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send(false);
                        }
                    });
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

mobile_order_functions.delete_from_library = function(req, res){

    var info = JSON.parse(req.body.data);
    var query = 'DELETE FROM `library_items` WHERE `id`="'+info.id+'";';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    query = "SELECT COUNT(id) AS val FROM `library_items` WHERE `library_id`='"+info.library_id+"';";
                    conn.query(query, function(err, result){
                        if(!err){
                            if(result[0].val > 0){
                                query = 'SELECT * FROM `library_items` WHERE `library_id`="'+info.library_id+'"';
                                conn.query(query, function(err, result){
                                    if(!err){
                                        res.send(result);
                                    }
                                    else{
                                        console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                        res.send(false);
                                    }
                                });
                            }
                            else res.send('empty');
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send(false);
                        }
                    });
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

mobile_order_functions.delete_library = function(req, res){

    //info : --> lib_id, phone_number
    var info = JSON.parse(req.body.data);
    var query = "SELECT COUNT(id) AS val FROM `library_items` WHERE `library_id`='"+info.lib_id+"';";

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    // if there are items in the library
                    if(result[0].val > 0){
                        query = 'DELETE FROM `library_items` WHERE `library_id`="'+info.lib_id+'";';
                        conn.query(query, function(err, result){
                            if(!err){
                                query = 'UPDATE `order_libraries` SET `lock`="1" WHERE `id`="'+info.lib_id+'";';
                                conn.query(query, function(err, result){
                                    if(!err){
                                        get_unlocked_libraries(res, conn, info.phone_number);
                                    }
                                    else{
                                        console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                        res.send(false);
                                    }
                                });
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send(false);
                            }
                        });
                    }
                    // if there are no items in the library
                    else{
                        query = 'UPDATE `order_libraries` SET `lock`="1" WHERE `id`="'+info.lib_id+'";';
                        conn.query(query, function(err, result){
                            if(!err){
                                get_unlocked_libraries(res, conn, info.phone_number);
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send(false);
                            }
                        });
                    }
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

// get the unlocked libraries for that user
function get_unlocked_libraries(res, conn, lib_phone_number){

    var query = 'SELECT COUNT(id) AS val FROM `order_libraries` WHERE `phone_number`="'+lib_phone_number+'" AND `lock`="0";';
    conn.query(query, function(err, result){
        if(!err){
            // after updating the deletion library lock to 1, if there are any unlocked libraries left for that user
            if(result[0].val > 0){
                query = 'SELECT * FROM `order_libraries` WHERE `phone_number`="'+lib_phone_number+'" AND `lock`="0";';
                conn.query(query, function(err, result){
                    if(!err){
                        res.send(result);
                    }
                    else{
                        console.log("There was an error with MySQL Query: " + query + ' ' + err);
                        res.send(false);
                    }
                });
            }
            // after updating the deletion library lock to 1, if there aren't any unlocked libraries left for that user return 'empty'
            else{
                res.send('empty');
            }
        }
        else{
            console.log("There was an error with MySQL Query: " + query + ' ' + err);
            res.send(false);
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

module.exports = mobile_order_functions;