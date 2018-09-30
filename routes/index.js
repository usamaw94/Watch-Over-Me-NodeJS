const express = require('express');
const router = express.Router();
const Log = require('../models/log');
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
    res.render("index", { title: 'Express', data : 'some text' });
})

router.get('/alllogs', function(req,res){
    var query = Log.find().sort('-_id');
    query.exec(function(err,log){
        //res.send(log);
        res.render('logs',{log});
    });
})

router.get("/addService", function(req, res){
    res.render("addService");
})

router.post("/addServiceProcessing",async function(req,res){

    var wearerPhone = req.body.wearerPhone;
    var wearerExistValue = req.body.wearerExistValue;
    var wearerFirstName = req.body.wearerFName;
    var wearerLastName = req.body.wearerLName;
    var wearerEmail = req.body.wearerEmail;
    var wearerFullName = wearerFirstName + " " + wearerLastName;
    var date = moment().format('DD/MM/YYYY');
    var time = moment().format('h:mm:ss a');

    var wearerId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

    var wearer = new Person({person_id: wearerId,person_full_name: wearerFullName});
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
    var watcherOneFullName = req.body.watcher1FName + " " + req.body.watcher1LName;
    var watcherOneEmail = req.body.watcher1Email;

    var watcherOneId = "WOMP" + FormatNumberLength(await getNextSequenceValue('Person'),8);

    var watcherOne = new Person({person_id: watcherOneId,person_full_name: watcherOneFullName});
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

    var watcherTwo = new Person({person_id: watcherTwoId,person_full_name: watcherTwoFullName});
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