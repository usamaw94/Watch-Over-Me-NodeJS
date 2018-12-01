const express = require('express');
const router = express.Router();
const Log = require('../models/log');

const Admin = require('../models/admin');

const Person = require('../models/person');
const Service = require('../models/service');
const Counter = require('../models/counter');
const personDetail = require('../models/personDetail');
const Relation = require('../models/relation');

const io = require('../server');
const moment = require('moment');
var assert = require('assert');

var personId = "";

var mongodb;
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://usamaw94:uw123456@ds127342.mlab.com:27342/womdb';

MongoClient.connect(url,function(err,db){
    assert.equal(null, err);
    mongodb = db;
})


router.get("/", function(req, res){
    if(!req.session.adminEmail) {
        res.render("login", { title: 'Express', data : 'some text' });
    } else {
        console.log(req.session.adminEmail);
        res.redirect('/adminHome');
    }
})

router.get("/adminHome", function(req, res){
    if(!req.session.adminEmail) {
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        console.log(req.session.adminEmail);
        res.render("index", { title: 'AdminDashboarc', session: req.session});
    }
})


router.post("/loginProcessing", function(req, res, next){

    var query = Admin.findOne({ admin_email: req.body.adminEmail, admin_password: req.body.adminPassword});
    query.exec(function(err,loginData){
        if(err){
            console.log(err);
            res.redirect('/');
        } else {
            //var admin = new Admin(JSON.stringify(loginData));
            if(loginData!=null){
                console.log(loginData.admin_email);
                req.session.adminEmail = loginData.admin_email;
                req.session.adminName = loginData.admin_name;
                res.redirect('/adminHome');
            } else {
                res.redirect('/');
            }
        }
    });
})

router.get('/services',function(req,res){
    if(!req.session.adminEmail) {
        res.redirect('/');
    } else{
        var services_list = [];

       var q = Service.aggregate([
        {
            $lookup:
            {
                from: 'persons',
                localField: 'wearer_id',
                foreignField: 'person_id',
                as: 'wearerInfo'
            }
        },
        {
            $lookup:
            {
                from: 'persons',
                localField: 'customer_id',
                foreignField: 'person_id',
                as: 'customerInfo'
            }
        },
        {
            $lookup:
            {
                from: 'relations',
                localField: 'service_id',
                foreignField: 'service_id',
                as: 'relationDetails'
            }
        },
        {
            $project:
            {
                serviceId : '$service_id',
                womNumber : '$wom_num',
                serviceStatus : '$status', 
                wearers: '$wearerInfo',
                customers: '$customerInfo',
                relationships : '$relationDetails',
                numberOfWatchers: {$size: "$relationDetails"},
            }
        }
        ])

        q.exec(function(err,result){
            res.render("services", {title: 'WOM Services', session: req.session, data : result});
        })
    }
})

router.get("/serviceDetails", function(req, res){
var serviceId = req.query.serviceID      ;
    console.log(serviceId);
    if(!req.session.adminEmail) {
        res.redirect('/');
    } else{
        var q = Service.aggregate([
            {
                $match:
                {
                    service_id: serviceId,                
                }
    
            },
            {
                $lookup:
                {
                    from: 'persons',
                    localField: 'wearer_id',
                    foreignField: 'person_id',
                    as: 'wearerInfo'
                }
            },
            {
                $lookup:
                {
                    from: 'persons',
                    localField: 'customer_id',
                    foreignField: 'person_id',
                    as: 'customerInfo'
                }
            },
            {
                $lookup:
                {
                    from: 'relations',
                    localField: 'service_id',
                    foreignField: 'service_id',
                    as: 'relationDetails'
                }
            },
            {
                $project:
                {
                    serviceId : '$service_id',
                    womNumber : '$wom_num',
                    serviceStatus : '$status',
                    serviceDate : '$service_reg_date',
                    serviceTime : '$service_reg_time',
                    wearers: '$wearerInfo',
                    customers: '$customerInfo',
                    relationships : '$relationDetails',
                    numberOfWatchers: {$size: "$relationDetails"},
                }
            }
            ])
    
            q.exec(function(err,result){

                var w = Relation.aggregate([
                    {
                        $match:
                        {
                            service_id: serviceId,                
                        }
            
                    },
                    {
                        $lookup:
                        {
                            from: 'persons',
                            localField: 'watcher_id',
                            foreignField: 'person_id',
                            as: 'watcherInfo'
                        }
                    },
                    {
                        $project:
                        {
                            watcherType: '$watcher_status',
                            priority : "priority_num",
                            watcherDetails : '$watcherInfo'
                        }
                    }
                    ])
            
                    w.exec(function(err,data){
                        var resultData = [];
                        resultData.push({service:result,watchers:data})
                        console.log(JSON.stringify(resultData));
                        res.render("serviceDetails", { title: 'ServiceDetails', session: req.session, serviceData: resultData });
                    })    
            })
    }
})


router.get('/showWatcherDetails:serviceId',function(req,res){

    console.log(req.params.serviceId);

    var serviceID = req.params.serviceId;

    var watcherId;
    var weareName;
    var wearerEmail;
    var wearerPhone;

    var q = Relation.aggregate([
        {
            $match:
            {
                service_id: serviceID,                
            }

        },
        {
            $lookup:
            {
                from: 'persons',
                localField: 'watcher_id',
                foreignField: 'person_id',
                as: 'watcherInfo'
            }
        },
        {
            $project:
            {
                watcherDetails : '$watcherInfo'
            }
        }
        ])

        q.exec(function(err,result){
            console.log(JSON.stringify(result));
            res.send(result);
        })
})

router.get('/checkWearerPhoneNumber/:phone',function(req,res){
    console.log(req.params.phone);
    var query = Person.findOne({phone_number: req.params.phone});
    query.exec(function(err,personData){
        if(err){
            console.log(err);
        }
        else{
            if(personData != null){
                var id = personData.person_id;
                var fname = personData.person_first_name;
                var lname = personData.person_last_name;
                var phone = personData.phone_number;
                var email = personData.email;

                var findWearer = Service.findOne({wearer_id: id});

                findWearer.exec(function(err,serviceData){
                    if(err){
                        console.log(err);
                    } else {
                        if(serviceData != null){
                            existStatus = 'wearer';
                            res.send({ existStatus, id, fname, lname, phone, email });
                        } else {
                            existStatus = 'yes';
                            res.send({ existStatus, id, fname, lname, phone, email });
                        }
                    }
                });
            }
            else{
                existStatus = 'no';
                res.send({ existStatus });
            }
        }
    });
})

router.get('/checkWatcherPhoneNumber/:phone',function(req,res){
    console.log(req.params.phone);
    var query = Person.findOne({phone_number: req.params.phone});
    query.exec(function(err,personData){
        if(err){
            console.log(err);
        }
        else{
            if(personData != null){
                var id = personData.person_id;
                var fname = personData.person_first_name;
                var lname = personData.person_last_name;
                var phone = personData.phone_number;
                var email = personData.email;

                existStatus = 'yes';
                res.send({ existStatus, id, fname, lname, phone, email });
            }
            else{
                existStatus = 'no';
                res.send({ existStatus });
            }
        }
    });
})

router.get('/checkCustomerPhoneNumber/:phone',function(req,res){
    console.log(req.params.phone);
    var query = Person.findOne({phone_number: req.params.phone});
    query.exec(function(err,personData){
        if(err){
            console.log(err);
        }
        else{
            if(personData != null){
                var id = personData.person_id;
                var fname = personData.person_first_name;
                var lname = personData.person_last_name;
                var phone = personData.phone_number;
                var email = personData.email;

                existStatus = 'yes';
                res.send({ existStatus, id, fname, lname, phone, email });
            }
            else{
                existStatus = 'no';
                res.send({ existStatus });
            }
        }
    });
})

router.get('/logout',function(req,res){
    req.session.destroy(function(err){
        res.redirect('/');
    });
})

router.get('/alllogs', function(req,res){
    var query = Log.find().sort('-_id');
    query.exec(function(err,log){
        //res.send(log);
        res.render('logs',{log});
    });
})

router.get("/addService", function(req, res){
    if(!req.session.adminEmail) {
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        console.log(req.session.adminEmail);
        res.render("addService", { title: 'Add new services', session: req.session});
    }
})

router.post("/addServiceProcessing",async function(req,res){


    var wearerId;
    var watcherId;
    var customerId;
    var serviceId;
    var womNumber;
    var organizationId;
    var date = moment().format('DD/MM/YYYY');
    var time = moment().format('h:mm:ss a');

    if(req.body.wearerExistId == ""){
        var wearerPhone = req.body.wearerPhone;
        var wearerFirstName = req.body.wearerFName;
        var wearerLastName = req.body.wearerLName;
        var wearerEmail = req.body.wearerEmail;

        wearerId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

        var wearer = new Person({person_id: wearerId,
            person_first_name: wearerFirstName,
            person_last_name: wearerLastName,
            phone_number: wearerPhone,
            email: wearerEmail,
            password: "womperson"});
        var wearerDetail = new personDetail({person_id: wearerId,
            phone_number: wearerPhone,
            email: wearerEmail,
            update_date: date,
            update_time: time
        });

        wearer.save().then(function(){
            wearerDetail.save();
        });
    }
    else{
        wearerId = req.body.wearerExistId;
    }

    if(req.body.watcherId == ""){

        var watcherOnePhone = req.body.watcher1Phone;
        var watcherOneEmail = req.body.watcher1Email;

        watcherId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

        var watcherOne = new Person({person_id: watcherId,
            person_first_name: req.body.watcher1FName,
            person_last_name: req.body.watcher1LName,
            phone_number: watcherOnePhone,
            email: watcherOneEmail,
            password: "womperson"});
        var watcherOneDetail = new personDetail({person_id: watcherId,
            phone_number: watcherOnePhone,
            email: watcherOneEmail,
            update_date: date,
            update_time: time
        });

        watcherOne.save().then(function(){
            watcherOneDetail.save();
            res.render('test',{data: JSON.stringify(watcherOne) + JSON.stringify(watcherOneDetail)});
        });
    }
    else{
        watcherId = req.body.watcherId;
    }

    if(req.body.customerId == ""){

        var customerPhone = req.body.customerPhone;
        var customerFirstName = req.body.customerFName;
        var customerLastName = req.body.customerLName;
        var customerEmail = req.body.customerEmail;

        customerId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

        var customer = new Person({person_id: customerId,
            person_first_name: customerFirstName,
            person_last_name: customerLastName,
            phone_number: customerPhone,
            email: customerEmail,
            password: "womperson"});
        var customerDetail = new personDetail({person_id: customerId,
            phone_number: customerPhone,
            email: customerEmail,
            update_date: date,
            update_time: time
        });

        customer.save().then(function(){
            customerDetail.save();
        });

    }
    else{
        customerId = req.body.customerId;
    }

    serviceId = "WOMS" + FormatNumberLength(await getNextSequenceValue('Service'),8);

    var service = new Service({service_id: serviceId,
        wearer_id: wearerId,
        wom_num: "Not assigned",
        customer_id: customerId,
        pharmacy_id: "WOMO00000661",
        service_reg_date: date,
        service_reg_time: time,
        status: "Pending"});
    
    var relation = new Relation({service_id: serviceId,
        watcher_id: watcherId,
        priority_num: "1",
        watcher_status: "Responding",
        updated_date: date,
        updated_time: time});
    
    service.save().then(function(){
        relation.save();
    });
})



router.get("/counterCheck",async function(req,res){

    var result = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8); 
    res.send(result);   
    
})

router.get('/showWearerDetails/:wearerId',function(req,res){
    console.log(req.params.wearerId);
    var query = Person.findOne({person_id: req.params.wearerId});
    query.exec(function(err,personData){
        if(err){
            console.log(err);
        }
        else{
            var id = personData.person_id;
            var fname = personData.person_first_name;
            var lname = personData.person_last_name;
            var phone = personData.phone_number;
            var email = personData.email;

            res.send(personData);
        
        }
    });
})

router.get('/showCustomerDetails/:customerId',function(req,res){
    console.log(req.params.customerId);
    var query = Person.findOne({person_id: req.params.customerId});
    query.exec(function(err,personData){
        if(err){
            console.log(err);
        }
        else{
            var id = personData.person_id;
            var fname = personData.person_first_name;
            var lname = personData.person_last_name;
            var phone = personData.phone_number;
            var email = personData.email;

            res.send(personData);
        
        }
    });
})

async function getNextSequenceValue(sequenceName){
    
    


    let query = await Counter.findOneAndUpdate({
        counter_seq_name : sequenceName,
        },{$inc:
            {counter_seq_num:1}
        },
        {upsert: true}
    ).exec();

    var personId = "" + query.counter_seq_num;
    console.log(personId);
    return personId;
}

function FormatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}

module.exports = router;