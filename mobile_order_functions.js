var express                 = require('express');
var mobile_order_functions  = express.Router();
var mysql                   = require('./mysql');


var app = require('./index');
var io = app.io;
io.sockets.on('connection', function(socket){});


mobile_order_functions.make_order = function(req, res){

    var order = JSON.parse(req.body.data);
    var customer = JSON.parse(order.customer_details);
    var order_obj = {
        my_cart: order.my_cart,
        order_date: order.order_date,
        order_time: order.order_time,
        total_price: order.total_price
    };
    var order_text = JSON.stringify(order_obj);
    var date = new Date();
    var query = 'INSERT INTO `last_orders`(' +
        '`order_json`, ' +
        '`phone_number`, ' +
        '`day`, ' +
        '`month`, ' +
        '`year`, ' +
        '`hour`, ' +
        '`minutes`, ' +
        '`order_type`, ' +
        '`customer_type`, ' +
        '`payment_method`, ' +
        '`total_price`) ' +
        'VALUES (' +
        '"'+mysql_real_escape_string(order_text)+'",' +
        '"'+customer.phone_number+'",' +
        '"'+date.getDate()+'",' +
        '"'+(date.getMonth()+1)+'",' +
        '"'+date.getFullYear()+'",' +
        '"'+order.order_hour+'",' +
        '"'+order.order_minutes+'",' +
        '"'+order.order_type+'",' +
        '"'+order.customer_type+'",' +
        '"'+order.payment_method+'",' +
        '"'+order.total_price+'");';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    query = 'SELECT COUNT(id) AS val FROM `pending_orders`;';
                    conn.query(query, function(err, result){
                        if(!err){
                            var phone_number = customer.phone_number;
                            if(result[0].val > 0){
                                query = 'SELECT MAX(serial_number) AS max_val FROM `pending_orders`;';
                                conn.query(query, function(err, result){
                                    if(!err){
                                        var serial_number = result[0].max_val + 1;
                                        query = 'INSERT INTO `pending_orders`(`cart`, `customer_details`, `phone_number`, `order_type`, `customer_type`, `payment_method`, `total_price`, `hour`, `minutes`, `status`, `serial_number`) ' +
                                        'VALUES ' +
                                        '("'+mysql_real_escape_string(order_text)+'",' +
                                        '"'+mysql_real_escape_string(JSON.stringify(customer))+'",' +
                                        '"'+phone_number+'",' +
                                        '"'+order.order_type+'",' +
                                        '"'+order.customer_type+'",' +
                                        '"'+order.payment_method+'",' +
                                        '"'+order.total_price+'",' +
                                        '"'+order.order_hour+'",' +
                                        '"'+order.order_minutes+'",' +
                                        '"1",' +
                                        '"'+serial_number+'");';
                                        conn.query(query, function(err, result){
                                            if(!err){
                                                if(is_follow_hour_order(order.order_hour, order.order_minutes)){
                                                    var data = {
                                                        order: order,
                                                        order_text: order_text,
                                                        customer: customer,
                                                        serial_number: serial_number,
                                                        order_id: result.insertId,
                                                        status: 1
                                                    };
                                                    io.emit('real-time-order', data);
                                                }
                                                res.send(true);
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
                            else{
                                query = 'INSERT INTO `pending_orders`(`cart`, `customer_details`, `phone_number`, `order_type`, `customer_type`, `payment_method`, `total_price`, `hour`, `minutes`, `status`, `serial_number`) ' +
                                'VALUES ' +
                                '("'+mysql_real_escape_string(order_text)+'",' +
                                '"'+mysql_real_escape_string(JSON.stringify(customer))+'",' +
                                '"'+phone_number+'",' +
                                '"'+order.order_type+'",' +
                                '"'+order.customer_type+'",' +
                                '"'+order.payment_method+'",' +
                                '"'+order.total_price+'",' +
                                '"'+order.order_hour+'",' +
                                '"'+order.order_minutes+'",' +
                                '"1",' +
                                '"1");';
                                conn.query(query, function(err, result){
                                    if(!err){
                                        if(is_follow_hour_order(order.order_hour, order.order_minutes)){
                                            var data = {
                                                order: order,
                                                order_text: order_text,
                                                customer: customer,
                                                serial_number: 1,
                                                order_id: result.insertId,
                                                status: 1
                                            };
                                            io.emit('real-time-order', data);
                                        }
                                        res.send(true);
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

                }
                else {
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send(false);
                }
                conn.release();
            });
        }
        else{console.log(err);}
    });

};

mobile_order_functions.last_orders = function(req, res){

    var phone_number = req.params.phone_number.split('=')[1];
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
                conn.release();
            });
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
                conn.release();
            });
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
                conn.release();
            });
        }
        else{console.log(err);}
    });
};

mobile_order_functions.new_library = function(req, res){

    var lib_details = JSON.parse(req.body.data);
    var date = new Date();
    var query = 'INSERT INTO `order_libraries`(' +
        '`phone_number`, ' +
        '`lib_name`, ' +
        '`lib_description`, ' +
        '`creation_date`, ' +
        '`creation_time`, ' +
        '`day`, ' +
        '`month`, ' +
        '`year`, ' +
        '`hour`, ' +
        '`minutes`, ' +
        '`customer_type`) ' +
        'VALUES (' +
        '"'+lib_details.phone_number+'",' +
        '"'+lib_details.lib_name+'",' +
        '"'+lib_details.lib_description+'",' +
        '"'+lib_details.creation_date+'",' +
        '"'+lib_details.creation_time+'", ' +
        '"'+date.getDate()+'", ' +
        '"'+(date.getMonth()+1)+'", ' +
        '"'+date.getFullYear()+'", ' +
        '"'+date.getHours()+'", ' +
        '"'+date.getMinutes()+'", ' +
        '"'+lib_details.customer_type+'");';

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
                conn.release();
            });
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
                conn.release();
            });
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
                conn.release();
            });
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
                conn.release();
            });
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
                conn.release();
            });
        }
        else{console.log(err);}
    });

};

mobile_order_functions.decrease_from_budget = function(req, res){

    var info = JSON.parse(req.body.data);
    var query = 'UPDATE `business_customers` SET `budget`="'+info.new_budget+'" WHERE `phone_number`="'+info.phone_number+'";';
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
                conn.release();
            });
        }
        else{
            res.send(false);
        }
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
        conn.release();
    });
}

function is_follow_hour_order(order_hour, order_minutes){
    var date = new Date();
    var curr_minutes = date.getMinutes();
    var curr_hour = date.getHours();
    if(order_hour == curr_hour) return true;
    if(order_hour == (curr_hour + 1)){
        if(order_minutes <= curr_minutes) return true;
    }
    return false;
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