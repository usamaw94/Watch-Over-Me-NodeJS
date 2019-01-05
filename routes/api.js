const express = require('express');
const router = express.Router();
const Log = require('../models/log');
var admin = require("firebase-admin");
var twilioClient = require('twilio')('ACdaf67e53a9f0bcce14aade68d1441ce3','3e3ee5debf15f29ec9d8bc21735edba9');
const Person = require('../models/person');
const Service = require('../models/service');
const Counter = require('../models/counter');
const personDetail = require('../models/personDetail');
const Relation = require('../models/relation');
// const io = require('../server');

// var socket = io.connect('http://localhost:5000');

var serviceAccount = require("../womproject-18095-firebase-adminsdk-4facv-ce9129eb22.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://womproject-18095.firebaseio.com"
});


function sendNotification(notificationTitle ,notificationBody, notificationPriority,regToken){
    var payload = {
        notification: {
          title: notificationTitle,
          body: notificationBody
        }
    };

    var options = {
        priority: notificationPriority,
        timeToLive: 5000
    };

    admin.messaging().sendToDevice(regToken, payload, options)
    .then(function(response) {
      console.log("Successfully sent message:", response);
    })
    .catch(function(error) {
      console.log("Error sending message:", error);
    });
}

function callingWatchers(watcherCount,registrationToken){

    var regToken = registrationToken;
    sendNotification("Connecting watcher","Now contacting watcher "+watcherCount,"High",regToken);
    if(watcherCount < 5){
        setTimeout(function(){
            setTimeout(function(){
                sendNotification("Watcher Response","Watcher "+watcherCount+" didn't respond","High",regToken);
            },15000);
            watcherCount++;
            setTimeout(function(){
                callingWatchers(watcherCount,regToken);
            },5000);
        },15000);
    }
    else{
        setTimeout(function(){
            sendNotification("Watcher Response","Watcher "+watcherCount+" is coming to help you","High",regToken);
        },15000);
    }
}

function alertProcesiing(registrationToken){
    sendNotification("Alert Received","We're calling help for you!","High",registrationToken);
    setTimeout(function(){
        callingWatchers(1,registrationToken);
    },3000);
}

router.post('/userloginprocessing',function(req,res){
    var q = Person.findOne({$and: [{phone_number : req.body.phone_num}, {password : req.body.password}]});
    q.exec(function(err,userData){
        if(err){
            console.log(err);
        }
        else{
            if(userData != null){
                var query = Service.findOne({wearer_id: userData.person_id});
                query.exec(function(err,serviceData){
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(serviceData != null){
                            res.send(serviceData.service_id);
                        }
                        else{
                            res.send("");
                        }
                    }
                })
            }
            else{
                res.send("");
            }
        }
    })
})

router.post('/logsprocessing', function(req,res){
    var log = new Log(req.body);
    var regToken = log['registration_token'];

    log.save().then(function(log){

        req.app.io.emit('logInserted', 'Data saved');

        alertProcesiing(regToken);
        res.send(log);

    });


});

router.get('/alllogs', function(req,res){
    var query = Log.find().sort('-_id');
    query.exec(function(err,log){
        res.send(log);
    });
});

router.post('/interactionlogprocessing',function(req,res){
    var hourlyLogs = [];
    hourlyLogs = req.body;
    
    Log.collection.insert(hourlyLogs,function(err,docs){
        if(err){
            console.error(err);
        }
        else{
            req.app.io.emit('logInserted', 'Data saved');

            res.send(JSON.stringify('Logs inserted'));
        }
    });
});

router.get('/connectionCheck', function(req,res){
    var count = 0;

    req.app.io.emit('playload', 'Data sent');
    res.send("Hello");
    //sendNotification("Alert received","We are calling help for you!","High","eUppQNG-AC8:APA91bHB5-_BlQlylM514ohDYiOErCDMIm1nfoIRsI33UC4pJL2ajT_ub2CoeY6VfM_i2jan9jrF2cYPQ-8Y3YFRiiF4dwbR8D9yt6uw0g4XEU-ai6at4lied3ggrtXyxYwop-xRWOHVKtb3nS7o270GtCTvQo2Ysw");

});

router.post('/hourlylogsprocessing', function(req,res){
    var log = new Log(req.body);
    log.save().then(function(log){

        req.app.io.emit('logInserted', 'Data saved');

        res.send(JSON.stringify('Hourly Log Inserted'));
    });
});

router.post('/contactsprocessing', function(req,res){
    
    var serviceId = req.body.service_id;

    console.log(JSON.stringify(serviceId));
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
                priority : "$priority_num",
                watcherId : { "$arrayElemAt": [ "$watcherInfo.person_id", 0 ] },
                watcherName : {"$concat": [ { "$arrayElemAt": [ "$watcherInfo.person_first_name", 0 ] }, " ", { "$arrayElemAt": [ "$watcherInfo.person_last_name", 0 ] }]},
                watcherPhone : { "$arrayElemAt": [ "$watcherInfo.phone_number", 0 ] }
            }
        }
        ])

        w.exec(function(err,data){
            res.send(JSON.stringify(data));
        })

});

router.post('/phoneMeRequest', function(req,res){
    twilioClient.messages.create({
        from: "+61488852471",
        to: req.body.recipient_num,
        body: req.body.message
    }).then((message) => console.log(message.sid));
    res.send(JSON.stringify("Request has been sent!"));
});

module.exports = router;
