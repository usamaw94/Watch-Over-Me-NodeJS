const express = require('express');
const router = express.Router();
const Log = require('../models/log');

const Admin = require('../models/admin');

const Person = require('../models/person');
const Device = require('../models/device');
const SIM = require('../models/sim');
const Organization = require('../models/organization');
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
                $lookup:
                {
                    from: 'organizations',
                    localField: 'pharmacy_id',
                    foreignField: 'organization_id',
                    as: 'pharmacyInfo'
                }
            },
            {
                $lookup:
                {
                    from: 'devices',
                    localField: 'device_id',
                    foreignField: 'device_id',
                    as: 'deviceInfo'
                }
            },
            {
                $lookup:
                {
                    from: 'sims',
                    localField: 'sim_id',
                    foreignField: 'sim_id',
                    as: 'simInfo'
                }
            },
            {
                $project:
                {
                    serviceId : '$service_id',
                    womNumber : '$wom_num',
                    deviceId : '$device_id',
                    simId : '$sim_id',
                    serviceStatus : '$status',
                    serviceDate : '$service_reg_date',
                    serviceTime : '$service_reg_time',
                    wearers: '$wearerInfo',
                    customers: '$customerInfo',
                    relationships : '$relationDetails',
                    pharmacy : '$pharmacyInfo',
                    device : '$deviceInfo',
                    sim : '$simInfo',
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

                        var devices = Device.find({ device_status : 'Available' });

                        devices.exec(function(err,devicesData){

                            var sims = SIM.find({ sim_status : 'Available'});
                            
                            sims.exec(function(err,simsData){

                                var resultData = [];
                                resultData.push({service:result,watchers:data,devicesResult:devicesData,simsResult:simsData})
                                console.log(JSON.stringify(resultData));
                                res.render("serviceDetails", { title: 'ServiceDetails', session: req.session, serviceData: resultData });

                            })

                        })
                    })    
            })
    }
})


router.get('/showWatcherDetails',function(req,res){

    console.log(req.query.serviceId);

    var serviceID = req.query.serviceId;

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

    var isPharmacy = 'yes';

    if(!req.session.adminEmail) {
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        console.log(req.session.adminEmail);
        var query = Organization.find({is_pharmacy: isPharmacy});
        query.exec(function(err,orgsData){
            console.log(orgsData);
            if(err){
                console.log(err);
            }
            else{
                res.render("addService", { title: 'Add new services', session: req.session, data : orgsData});
            }
        })
    }
})

router.post("/addServiceProcessing",async function(req,res){


    var wearerId;
    var watcherId;
    var customerId;
    var serviceId;
    var womNumber;
    var pharmacyId = req.body.pharmacy;
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

    if(req.body.customer == "Other"){

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
    else if (req.body.customer == "watcher"){
        customerId = watcherId;
    }
    else if(req.body.customer == "wearer"){
        customerId = wearerId;
    }

    serviceId = "WOMS" + FormatNumberLength(await getNextSequenceValue('Service'),8);

    var service = new Service({service_id: serviceId,
        wearer_id: wearerId,
        wom_num: "Not assigned",
        customer_id: customerId,
        pharmacy_id: pharmacyId,
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



router.get('/checkNewWatcherPhoneNumber',function(req,res){
    console.log(req.query.phone);
    console.log(req.query.serviceId);

    var serviceId = req.query.serviceId;
    var query = Person.findOne({phone_number: req.query.phone});
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
                var q = Relation.findOne({$and: [{watcher_id : id}, {service_id : serviceId}]});
                q.exec(function(err,relationData){
                    if(err){
                        console.log(err)
                    }
                    else{
                        var  watcherExist = "no";
                        if(relationData != null){
                            watcherExist = "yes";
                        }
                        
                        res.send({ existStatus, watcherExist, id, fname, lname, phone, email });
                    }

                })
            }
            else{
                existStatus = 'no';
                var  watcherExist = "no"
                res.send({ existStatus,watcherExist });
            }
        }
    });
})

router.get('/addNewWatcher',async function(req,res){
    var serviceId = req.query.serviceId;
    var watcherPhone = req.query.watcherPhone;
    var watcherId;
    var wFName = req.query.watcherFName;
    var wLName = req.query.watcherLName;
    var wEmail = req.query.watcherEmail;
    var numWatchers = req.query.numWatchers;
    var priority = parseInt(numWatchers) + 1;
    var date = moment().format('DD/MM/YYYY');
    var time = moment().format('h:mm:ss a');

    console.log(priority);

    if(req.query.watcherId == ''){
        console.log('new watcher');
        watcherId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

        var newWatcher = new Person({person_id: watcherId,
        person_first_name: wFName,
        person_last_name: wLName,
        phone_number: watcherPhone,
        email: wEmail,
        password: "womperson"});

        var newWatcherDetail = new personDetail({person_id: watcherId,
        phone_number: watcherPhone,
        email: wEmail,
        update_date: date,
        update_time: time
        });

        newWatcher.save().then(function(){
            newWatcherDetail.save();
        });
    }
    else{
        console.log("alraedy exist");
        watcherId = req.query.watcherId;
    } 

    var newRelation = new Relation({service_id: serviceId,
        watcher_id: watcherId,
        priority_num: priority + "",
        watcher_status: "Responding",
        updated_date: date,
        updated_time: time
    });

    newRelation.save();
    res.send("Watcher added");
})

router.get("/devices", function(req, res){
    if(!req.session.adminEmail) {
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        console.log(req.session.adminEmail);
        var query = Device.find();
        query.exec(function(err,devicesData){
            console.log(devicesData);
            if(err){
                console.log(err);
            }
            else{
                res.render("devices", { title: 'Devices', session: req.session, data : devicesData});
            }
        })
    }
})


router.get('/addNewDevice',async function(req,res){
    var imei = req.query.imei;
    var manufacturer = req.query.manufacturer;
    var model = req.query.model;
    var deviceYear = req.query.deviceYear;
    var status = "Available";
    var date = moment().format('DD/MM/YYYY');
    var time = moment().format('h:mm:ss a');

    deviceId = "WOMD" + FormatNumberLength(await getNextSequenceValue('Device'),8);

    var newDevice = new Device({device_id: deviceId,
        device_imei: imei,
        device_manufacturer: manufacturer,
        device_model: model,
        device_year: deviceYear,
        device_status: status,
        device_date: date,
        device_time: time});

        newDevice.save().then(function(err){
            res.send("Device added");
        });
})

router.get("/sims", function(req, res){
    if(!req.session.adminEmail) {
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        console.log(req.session.adminEmail);
        var query = SIM.find();
        query.exec(function(err,simsData){
            console.log(simsData);
            if(err){
                console.log(err);
            }
            else{
                res.render("sims", { title: 'SIMs', session: req.session, data : simsData});
            }
        })
    }
})

router.get('/addNewSIM',async function(req,res){

    var simNum = req.query.simNum;
    var provider = req.query.simProvider;
    var womNum = req.query.womNum;
    var status = "Available";
    var date = moment().format('DD/MM/YYYY');
    var time = moment().format('h:mm:ss a');

    simId = "WOMSM" + FormatNumberLength(await getNextSequenceValue('sim'),7);

    var newSIM = new SIM({
        sim_id: simId,
        sim_num: simNum,
        sim_provider: provider,
        wom_num: womNum,
        sim_status: status,
        sim_date: date,
        sim_time: time});

        newSIM.save().then(function(err){
            res.send("SIM added");
        });
})

router.get("/organizations", function(req, res){
    if(!req.session.adminEmail) {
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        console.log(req.session.adminEmail);
        var query = Organization.find();
        query.exec(function(err,orgsData){
            console.log(orgsData);
            if(err){
                console.log(err);
            }
            else{
                res.render("organizations", { title: 'Organizations', session: req.session, data : orgsData});
            }
        })
    }
})

router.get('/addNewOrganization',async function(req,res){

    var orgName = req.query.orgName;
    var orgPhone = req.query.orgPhone;
    var orgEmail = req.query.orgEmail;
    var orgAddress = req.query.orgAddress;
    var orgReference = req.query.orgReference;
    var isPharmacy = req.query.isPharmacy;
    var orgPrimaryContact = req.query.orgPrimaryContact;
    var orgSecondaryContact = req.query.orgSecondaryContact;
    var date = moment().format('DD/MM/YYYY');
    var time = moment().format('h:mm:ss a');

    orgId = "WOMO" + FormatNumberLength(await getNextSequenceValue('Organization'),8);

    var newOrg = new Organization({
        organization_id: orgId,
        organization_name: orgName,
        organization_phone: orgPhone,
        organization_email: orgEmail,
        organization_address: orgAddress,
        organization_ref_num: orgReference,
        is_pharmacy: isPharmacy,
        org_primary_contact_name: orgPrimaryContact,
        org_secondary_contact_name: orgSecondaryContact,
        organization_date: date,
        organization_time: time});

        newOrg.save().then(function(err){
            res.send("Organization added");
        });
})


router.post("/activateService", function(req, res, next){

    var serviceId =  req.body.serviceId;
    var simId =  req.body.simId;
    var womNumber =  req.body.womNumber;
    var device =  req.body.device;

    if(!req.session.adminEmail) {
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        Service.findOne({ service_id: serviceId }, function (err, serviceData){
            serviceData.wom_num = womNumber;
            serviceData.device_id = device;
            serviceData.sim_id = simId;
            serviceData.status = 'Activated';
            serviceData.save();
        });

        Device.findOne({ device_id: device }, function (err, deviceData){
            deviceData.device_status = 'Assigned';
            deviceData.save();
        });

        SIM.findOne({ sim_id: simId }, function (err, simData){
            simData.sim_status = 'Assigned';
            simData.save();
        });

        res.redirect('/serviceDetails?serviceID='+ serviceId);
    }
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