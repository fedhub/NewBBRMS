var express = require('express');
var business = express.Router();
var mysql = require('./mysql');
var settings = require('./settings');

business.get('/business-companies', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '#', name: 'חברות'}];

    var query = 'SELECT COUNT(*) AS count FROM `business_companies`;';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    if(result[0].count > 0){
                        query = 'SELECT * FROM `business_companies`;';
                        conn.query(query, function(err, result){
                            if(!err){
                                res.render('business-companies', {
                                    username: settings.get_username(),
                                    breadcrumbs: breadcrumbs,
                                    companies: result
                                });
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send('404 not found');
                            }
                        });
                    }
                    else{
                        res.render('business-companies', {
                            username: settings.get_username(),
                            breadcrumbs: breadcrumbs,
                            companies: []
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

business.get('/add-company-page', function(req, res){

    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/business-companies', name: 'חברות'},
        {path: '#', name: 'הוספת חברה'}];

    res.render('add-company', {
        username: settings.get_username(),
        breadcrumbs: breadcrumbs,
        form_items: add_manager_form()
    });

});

business.post('/add-company', function(req, res){

    var company = JSON.parse(req.body.data);
    var date = new Date();
    var query = 'INSERT INTO `business_companies`(`company_name`, `street`, `house_number`, `floor`, `enter`, `company_code`, `representative`, `register_day`, `register_month`, `register_year`) ' +
        'VALUES ("'+company.company_name+'",' +
        '"'+mysql_real_escape_string(company.street)+'",' +
        '"'+company.house_number+'",' +
        '"'+company.floor+'",' +
        '"'+company.enter+'",' +
        '"'+company.company_code+'",' +
        '"'+company.representative+'",' +
        '"'+date.getDate()+'",' +
        '"'+(date.getMonth()+1)+'",' +
        '"'+date.getFullYear()+'")';
    mysql.getConnection(function(err, conn){
        if(!err) {
            conn.query(query, function (err, result) {
                if (!err) {
                    res.send({status: true});
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהוספת החברה החדשה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהוספת החברה החדשה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

business.get('/company&:company_name&:company_code', function(req, res){

    var company_name = req.params.company_name.split('=')[1];
    var company_code = req.params.company_code.split('=')[1];
    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/business-companies', name: 'חברות'},
        {path: '#', name: company_name}];

    var query = 'SELECT * FROM `business_customers` WHERE `company_code`="'+company_code+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('company', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        company_name: company_name,
                        company_code: company_code,
                        customers: result
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send('404 not found');
                }
            });
        }
        else{
            res.send('404 not found');
        }
    });

});

business.get('/add-customer-page&:company_name&:company_code', function(req, res){

    var company_name = req.params.company_name.split('=')[1];
    var company_code = req.params.company_code.split('=')[1];

    var breadcrumbs = [{path: '/', name: 'דף הבית'},
        {path: '/business-companies', name: 'חברות'},
        {path: '/company&company_name='+company_name+'&company_code='+company_code, name: company_name},
        {path: '#', name: 'הוספת לקוח עסקי'}];

    var query = 'SELECT * FROM `business_companies` WHERE `company_code`="'+company_code+'";';
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    res.render('add-customer', {
                        username: settings.get_username(),
                        breadcrumbs: breadcrumbs,
                        company_name: company_name,
                        company_code: company_code,
                        form_items: add_customer_form(result[0])
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send('404 not found');
                }
                conn.release()
            });
        }
        else{
            res.send('404 not found');
        }
    });

});

business.post('/add-customer', function(req, res){

    var customer = JSON.parse(req.body.data);
    var date = new Date();
    var query = 'INSERT INTO `business_customers`(`first_name`,`last_name`,`phone_number`,`email`,`street`,`house_number`,`floor`,`enter`,`budget`,`password`,`company_code`,`company_name`,`register_day`,`register_month`,`register_year`) ' +
        'VALUES (' +
        '"'+customer.first_name+'",' +
        '"'+customer.last_name+'",' +
        '"'+customer.phone_number+'",' +
        '"'+customer.email+'",' +
        '"'+mysql_real_escape_string(customer.street)+'",' +
        '"'+customer.house_number+'",' +
        '"'+customer.floor+'",' +
        '"'+customer.enter+'",' +
        '"'+customer.budget+'",' +
        '"'+customer.password+'",' +
        '"'+customer.company_code+'",' +
        '"'+customer.company_name+'",' +
        '"'+date.getDate()+'",' +
        '"'+(date.getMonth()+1)+'",' +
        '"'+date.getFullYear()+'")';
    mysql.getConnection(function(err, conn){
        if(!err) {
            conn.query(query, function (err, result) {
                if (!err) {
                    if(customer.budget > 0){
                        query = 'INSERT INTO `business_budgets`(`phone_number`, `company_code`, `budget`, `budget_day`, `budget_month`, `budget_year`) ' +
                        'VALUES ' +
                        '("'+customer.phone_number+'","'+customer.company_code+'","'+customer.budget+'","'+date.getDate()+'","'+(date.getMonth()+1)+'","'+date.getFullYear()+'")';
                        conn.query(query, function(err, result){
                            if(!err){
                                res.send({status: true});
                            }
                            else{
                                console.log("There was an error with MySQL Query: " + query + ' ' + err);
                                res.send({status: false, msg: 'הייתה בעיה בהוספת התקציב החדש לרשימת התקציבים של הלקוח'});
                            }
                        });
                    }
                    else {
                        res.send({status: true});
                    }
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בהוספת הלקוח העסקי החדש, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בהוספת הלקוח העסקי החדש, אנא נסה שוב מאוחר יותר'});
        }
    });

});

business.get('/customer-deposits&:customer_id', function(req, res){

    var customer_id = req.params.customer_id.split('=')[1];
    var query = 'SELECT * FROM `business_customers` WHERE `id`='+customer_id;
    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var customer = result[0];
                    var query = 'SELECT * FROM `business_budgets` WHERE `phone_number`="'+customer.phone_number+'";';
                    conn.query(query, function(err, result){
                        if(!err){
                            var breadcrumbs = [{path: '/', name: 'דף הבית'},
                                {path: '/business-companies', name: 'חברות'},
                                {path: '/company&company_name='+customer.company_name+'&company_code='+customer.company_code, name: customer.company_name},
                                {path: '#', name: 'הפקדות ללקוח'}];
                            res.render('customer-deposits', {
                                username: settings.get_username(),
                                breadcrumbs: breadcrumbs,
                                customer: customer,
                                budgets: normalize_dates(result)
                            });
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send('404 not found');
                        }
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

business.post('/make-deposit&:phone_number&:company_code&:deposit&:budget', function(req, res){

    var phone_number = req.params.phone_number.split('=')[1];
    var company_code = req.params.company_code.split('=')[1];
    var deposit = req.params.deposit.split('=')[1];
    var budget = req.params.budget.split('=')[1];
    var date = new Date();
    var query = 'INSERT INTO `business_budgets`(`phone_number`, `company_code`, `budget`, `budget_day`, `budget_month`, `budget_year`) ' +
        'VALUES ' +
        '("'+phone_number+'",' +
        '"'+company_code+'",' +
        '"'+deposit+'",' +
        '"'+date.getDate()+'",' +
        '"'+(date.getMonth()+1)+'",' +
        '"'+date.getFullYear()+'");';

    mysql.getConnection(function(err, conn){
        if(!err){
            conn.query(query, function(err, result){
                if(!err){
                    var new_budget = parseInt(deposit) + parseInt(budget);
                    query = 'UPDATE `business_customers` SET `budget`="'+new_budget+'" WHERE `phone_number`="'+phone_number+'";';
                    conn.query(query, function(err, result){
                        if(!err){
                            res.send({status: true});
                        }
                        else{
                            console.log("There was an error with MySQL Query: " + query + ' ' + err);
                            res.send({status: false, msg: 'הייתה בעיה בתהליך ההפקדה, אנא נסה שוב מאוחר יותר'});
                        }
                    });
                }
                else{
                    console.log("There was an error with MySQL Query: " + query + ' ' + err);
                    res.send({status: false, msg: 'הייתה בעיה בתהליך ההפקדה, אנא נסה שוב מאוחר יותר'});
                }
                conn.release();
            });
        }
        else{
            res.send({status: false, msg: 'הייתה בעיה בתהליך ההפקדה, אנא נסה שוב מאוחר יותר'});
        }
    });

});

function normalize_dates(result){
    for(var i = 0; i < result.length; i++){
        if(result[i].budget_day < 10){
            result[i].budget_day = '0' + result[i].budget_day;
        }
        if(result[i].budget_month < 10){
            result[i].budget_month = '0' + result[i].budget_month;
        }
    }
    return result;
}

function add_manager_form(){
    return [
        {required: '*', type: 'text', label: 'שם החברה:', max_length: 35, id: 'company-name'},
        {required: '*', type: 'text', label: 'רחוב:', max_length: 20, id: 'street'},
        {required: '*', type: 'text', label: 'מספר בית:', max_length: 3, id: 'house-number'},
        {required: '*', type: 'text', label: 'קומה:', max_length: 2, id: 'floor'},
        {required: '', type: 'text', label: 'כניסה:', max_length: 1, id: 'enter'},
        {required: '*', type: 'text', label: 'קוד חברה:', max_length: 4, id: 'company-code'},
        {required: '*', type: 'text', label: 'טלפון איש קשר:', max_length: 10, id: 'representative'}

    ];
}

function add_customer_form(address){
    return [
        {required: '*', type: 'text', label: 'שם פרטי:', max_length: 20, id: 'first-name', value: ''},
        {required: '*', type: 'text', label: 'שם משפחה:', max_length: 20, id: 'last-name', value: ''},
        {required: '*', type: 'text', label: 'מספר טלפון:', max_length: 10, id: 'phone-number', value: ''},
        {required: '', type: 'text', label: 'דוא"ל:', max_length: 50, id: 'email', value: ''},
        {required: '*', type: 'text', label: 'רחוב:', max_length: 20, id: 'street', value: address.street},
        {required: '*', type: 'text', label: 'מספר בית:', max_length: 3, id: 'house-number', value: address.house_number},
        {required: '*', type: 'text', label: 'קומה:', max_length: 2, id: 'floor', value: address.floor},
        {required: '', type: 'text', label: 'כניסה:', max_length: 1, id: 'enter', value: address.enter},
        {required: '*', type: 'text', label: 'יתרה:', max_length: 4, id: 'budget', value: ''},
        {required: '*', type: 'password', label: 'סיסמה:', max_length: 15, id: 'password', value: ''}
    ];
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

module.exports = business;