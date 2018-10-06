const express = require('express');
const router = express.Router();
const Log = require('../models/log');

const Admin = require('../models/admin');

const Person = require('../models/person');
const Counter = require('../models/counter');
const personDetail = require('../models/personDetail');

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
        console.log(req.session.adminEmail);
        res.redirect('/');
    } else{
        console.log(req.session.adminEmail);
        res.render("services", { title: 'WOM Services', session: req.session});
    }
})

router.get('/checkWearerPhoneNumber/:phone',function(req,res){
    console.log(req.params.phone);
    var query = personDetail.findOne({phone_number: req.params.phone});
    query.exec(function(err,personData){
        if(err){
            console.log(err);
        }
        else{
            if(personData != null){
                var id = personData.person_id
                existStatus = 'yes';

                res.send({ existStatus, id });
            }
            else{
                existStatus = 'no';
                res.send({ existStatus, id });
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

    var wearerPhone = req.body.wearerPhone;
    var wearerExistValue = req.body.wearerExistValue;
    var wearerFirstName = req.body.wearerFName;
    var wearerLastName = req.body.wearerLName;
    var wearerEmail = req.body.wearerEmail;
    var date = moment().format('DD/MM/YYYY');
    var time = moment().format('h:mm:ss a');

    var wearerId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

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


    var watcherOnePhone = req.body.watcher1Phone;
    var watcherOneEmail = req.body.watcher1Email;

    var watcherOneId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

    var watcherOne = new Person({person_id: watcherOneId,
        person_first_name: req.body.watcher1FName,
        person_last_name: req.body.watcher1LName,
        phone_number: watcherOnePhone,
        email: watcherOneEmail,
        password: "womperson"});
    var watcherOneDetail = new personDetail({person_id: watcherOneId,
        phone_number: watcherOnePhone,
        email: watcherOneEmail,
        update_date: date,
        update_time: time
    });

    watcherOne.save().then(function(){
        watcherOneDetail.save();
        res.render('test',{data: JSON.stringify(watcherOne) + JSON.stringify(watcherOneDetail)});
    });

    var watcherTwoPhone = req.body.watcher2Phone;
    var watcherTwoFullName = req.body.watcher2FName + " " + req.body.watcher2LName;
    var watcherTwoEmail = req.body.watcher2Email;

    var watcherTwoId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

    var watcherTwo = new Person({person_id: watcherTwoId,
        person_first_name: req.body.watcher2FName,
        person_last_name: req.body.watcher2LName,
        phone_number: watcherTwoPhone,
        email: watcherTwoEmail,
        password: "womperson"
    });
    var watcherTwoDetail = new personDetail({person_id: watcherTwoId,
        phone_number: watcherTwoPhone,
        email: watcherTwoEmail,
        update_date: date,
        update_time: time
    });

    watcherTwo.save().then(function(){
        watcherTwoDetail.save();
        res.render('test',{data: JSON.stringify(watcherTwo) + JSON.stringify(watcherTwoDetail)});
    });
    
})



router.get("/counterCheck",async function(req,res){

    var result = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8); 
    res.send(result);   
    
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