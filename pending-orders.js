var express = require('express');
var pending = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

var app = require('./index');
var io = app.io;

pending.get('/pending-orders', function(req, res){

    var query = 'SELECT COUNT(id) AS val FROM `pending_orders`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        var date = new Date();
                        var hour = date.getHours();
                        query = 'SELECT * FROM `pending_orders` WHERE `hour`="'+hour+'" OR `hour`="'+(hour+1)+'";';
                        conn.query(query, function(err, result){
                            if(!err){
                                settings.reset_stats();
                                var order_arr = get_order_arr(result);
                                order_arr = sort_orders(order_arr);
                                res.render('pending-orders', {
                                    order_arr: order_arr,
                                    delivery_count: settings.get_delivery_count(),
                                    take_away_count: settings.get_take_away_count(),
                                    sit_count: settings.get_sit_count(),
                                    business_count: settings.get_business_count(),
                                    private_count: settings.get_private_count(),
                                    credit_count: settings.get_credit_count(),
                                    cash_count: settings.get_cash_count()
                                });
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send('404 not found');
                            }
                        });
                    }
                    else{
                        settings.reset_stats();
                        res.render('pending-orders', {
                            order_arr: [],
                            delivery_count: settings.get_delivery_count(),
                            take_away_count: settings.get_take_away_count(),
                            sit_count: settings.get_sit_count(),
                            business_count: settings.get_business_count(),
                            private_count: settings.get_private_count(),
                            credit_count: settings.get_credit_count(),
                            cash_count: settings.get_cash_count()
                        });
                    }
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

pending.post('/close-pending-order&:order_id', function(req, res){

    var order_id = req.params.order_id.split('=')[1];
    var query = 'DELETE FROM `pending_orders` WHERE `id`='+order_id+';';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בסגירת ההזמנה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בסגירת ההזמנה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

pending.post('/update-order-status&:new_status&:order_id&:phone_number', function(req, res){

    var order_id = req.params.order_id.split('=')[1];
    var new_status = req.params.new_status.split('=')[1];
    var phone_number = req.params.phone_number.split('=')[1];
    var query = 'UPDATE `pending_orders` SET `status`="'+new_status+'" WHERE `id`="'+order_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    io.sockets.emit('update-status', {
                        new_status: new_status,
                        phone_number: phone_number
                    });
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון סטאטוס ההזמנה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון סטאטוס ההזמנה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

pending.post('/get-status&:phone_number', function(req, res){

    var phone_number = req.params.phone_number.split('=')[1];
    var query = 'SELECT COUNT(id) AS val FROM `pending_orders` WHERE `phone_number`="'+phone_number+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].val > 0){
                        query = 'SELECT MIN(hour) AS min_hour FROM `pending_orders` WHERE `phone_number`="'+phone_number+'";';
                        conn.query(query, function(err, result){
                            if(!err){
                                var min_hour = result[0].min_hour;
                                query = 'SELECT MIN(minutes) AS min_minutes FROM `pending_orders` WHERE `phone_number`="'+phone_number+'" AND `hour`="'+min_hour+'";';
                                conn.query(query, function(err, result){
                                    if(!err){
                                        var min_minutes = result[0].min_minutes;
                                        query = 'SELECT `status`,`order_type` FROM `pending_orders` WHERE `phone_number`="'+phone_number+'" AND `hour`="'+min_hour+'" AND `minutes`="'+min_minutes+'";';
                                        conn.query(query, function(err, result){
                                            if(!err){
                                                var status_text_arr = [];
                                                status_text_arr.push('הזמנה התקבלה');
                                                status_text_arr.push('בהכנה');
                                                if(result[0].order_type == 'sit'){
                                                    status_text_arr.push('בצלחת');
                                                    status_text_arr.push('מחכה לך!');
                                                }
                                                if(result[0].order_type == 'delivery'){
                                                    status_text_arr.push('אריזה');
                                                    status_text_arr.push('בדרך אליך!');
                                                }
                                                if(result[0].order_type == 'take-away'){
                                                    status_text_arr.push('אריזה');
                                                    status_text_arr.push('בדרך אליך!');
                                                }
                                                res.send({status: result[0].status, status_text: status_text_arr});
                                            }
                                            else{
                                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                                res.send({status: false, msg: 'הייתה בעיה בהבאת סטאטוס ההזמנה שלך, אנא נסה שוב מאוחר יותר'});
                                            }
                                        });
                                    }
                                    else{
                                        console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                        res.send({status: false, msg: 'הייתה בעיה בהבאת סטאטוס ההזמנה שלך, אנא נסה שוב מאוחר יותר'});
                                    }
                                });
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בהבאת סטאטוס ההזמנה שלך, אנא נסה שוב מאוחר יותר'});
                            }
                        });
                    }
                    else{
                        res.send({status: -1});
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהבאת סטאטוס ההזמנה שלך, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהבאת סטאטוס ההזמנה שלך, אנא נסה שוב מאוחר יותר'});
        }
    });

});

pending.post('/update-order-time', function(req, res){
    var info = JSON.parse(req.body.data);
    console.log(info.new_hour);
    console.log(info.new_minutes);
    var query = 'UPDATE `pending_orders` SET `hour`="'+info.new_hour+'",`minutes`="'+info.new_minutes+'" WHERE `id`="'+info.order_id+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בעדכון שעת ההזמנה, אנא נסה שנית מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בעדכון שעת ההזמנה, אנא נסה שנית מאוחר יותר'});
        }
    });

});

function get_order_arr(result){
    var order_arr = [];
    var status_text = [];
    for(var i = 0; i < result.length; i++){
        var hour = '', minutes = '';
        var customer_type = result[i].customer_type;
        var payment_method = result[i].payment_method;
        var order_type = result[0].order_type;
        if(order_type == 'delivery'){
            status_text.push('אריזה');
            status_text.push('בדרך אליך!');
            order_type = 'משלוח';
            settings.inc_delivery_count();
        }
        if(order_type == 'take-away'){
            status_text.push('אריזה');
            status_text.push('מחכה לך!');
            order_type = 'לקחת';
            settings.inc_take_away_count();
        }
        if(order_type == 'sit'){
            status_text.push('בצלחת');
            status_text.push('מחכה לך!');
            order_type = 'לשבת';
            settings.inc_sit_count();
        }
        if(customer_type == 'private'){
            settings.inc_private_count();
            customer_type = 'פרטי';
            if(payment_method == 'cash'){
                payment_method = 'מזומן';
                settings.inc_cash_count();
            }
            if(payment_method == 'credit'){
                payment_method = 'אשראי';
                settings.inc_credit_count();
            }
        }
        if(customer_type == 'business'){
            payment_method = '';
            customer_type = 'עסקי';
            settings.inc_business_count();
        }
        if(result[i].hour.toString().length == 1) hour = '0' + result[i].hour;
        else hour = result[i].hour.toString();
        if(result[i].minutes.toString().length == 1) minutes = '0' + result[i].minutes;
        else minutes = result[i].minutes.toString();
        var cart = JSON.parse(result[i].cart);
        cart = JSON.parse(cart.my_cart);
        var order = {
            id: result[i].id,
            status: result[i].status,
            cart: cart,
            customer: get_customer_array(JSON.parse(result[i].customer_details), customer_type),
            order_type: order_type,
            customer_type: customer_type,
            payment_method: payment_method,
            total_price: result[i].total_price,
            order_time: hour + ':' + minutes,
            serial_number: result[i].serial_number,
            status_text: status_text
        };
        order_arr.push(order);
    }
    return order_arr;
}

function get_customer_array(customer, customer_type){
    var company_code = '', company_name = '';
    if(customer_type == 'עסקי'){
        company_code = customer.company_code;
        company_name = customer.company_name;
    }
    return [
        {label: 'שם פרטי:', info: customer.first_name},
        {label: 'שם משפחה:', info: customer.last_name},
        {label: 'מספר טלפון:', info: customer.phone_number},
        {label: 'דוא"ל:', info: customer.email},
        {label: 'קוד חברה:', info: company_code},
        {label: 'שם חברה:', info: company_name},
        {label: 'רחוב:', info: customer.street},
        {label: 'מספר בית:', info: customer.house_number},
        {label: 'קומה:', info: customer.floor},
        {label: 'כניסה:', info: customer.enter}
    ];
}

function sort_orders(order_arr){
    var date = new Date();
    var curr_hour = date.getHours();
    var curr_minutes = date.getMinutes();
    var next_hour = curr_hour + 1;
    var curr_hour_arr = [], next_hour_arr = [];
    var curr_minutes_arr = [], next_minutes_arr = [];
    var order_minutes;
    for(var i = 0; i < order_arr.length; i++){
        var order_time = order_arr[i].order_time.split(':');
        var order_hour = parseInt(order_time[0]);
        order_minutes = parseInt(order_time[1]);
        if(order_hour == curr_hour) {
            curr_hour_arr.push(order_arr[i]);
            curr_minutes_arr.push(order_minutes);
        }
        if(order_hour == next_hour && order_minutes <= curr_minutes){
            next_hour_arr.push(order_arr[i]);
            next_minutes_arr.push(order_minutes);
        }
    }
    curr_minutes_arr.sort(function(a, b){return a-b});
    next_minutes_arr.sort(function(a, b){return a-b});
    //console.log(curr_minutes_arr);
    curr_minutes_arr = remove_duplicates(curr_minutes_arr);
    next_minutes_arr = remove_duplicates(next_minutes_arr);
    var curr_arr = [], next_arr = [];
    for(var i = 0; i < curr_minutes_arr.length; i++){
        for(var j = 0; j < curr_hour_arr.length; j++){
            order_minutes = parseInt(curr_hour_arr[j].order_time.split(':')[1]);
            if(order_minutes == curr_minutes_arr[i]){
                curr_arr.push(curr_hour_arr[j]);
            }
        }
    }
    for(var i = 0; i < next_minutes_arr.length; i++){
        for(var j = 0; j < next_hour_arr.length; j++){
            order_minutes = parseInt(next_hour_arr[j].order_time.split(':')[1]);
            if(order_minutes == next_minutes_arr[i]){
                next_arr.push(next_hour_arr[j]);
            }
        }
    }
    return curr_arr.concat(next_arr);
}

function remove_duplicates(arr){
    var unique = arr.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });
    return unique;
}

module.exports = pending;

