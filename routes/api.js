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
const MessagingResponse = require('twilio').twiml.MessagingResponse;
// const io = require('../server');

// var socket = io.connect('http://localhost:5000');

var serviceAccount = require("../womproject-18095-firebase-adminsdk-4facv-ce9129eb22.json");


var helpMeStatus = false;

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

function callingWatchers(watcherCount,registrationToken,log,data){

    var regToken = registrationToken;
    var recNum = "+61" + JSON.stringify(data.watcherPhone).substring(1);
    var msg = "-\nYour wearer is in trouble contact him/her as soon as possible. \n\nLocation : https://www.google.com/maps/dir//"+log.location_latitude+","+log.location_longitude+"\n\nIf you are responding the reply with 'yes'. If you can't reply with 'no'\n\nRegards\nWOM Team";
    sendNotification("Connecting watcher","Now contacting watcher "+watcherCount,"High",regToken);
    twilioClient.messages.create({
        from: "+61488852471",
        to: recNum,
        body: msg
    }).then(function(){
        setTimeout(function(){

        },20000)
    });


        /*setTimeout(function(){
            setTimeout(function(){
                sendNotification("Watcher Response","Watcher "+watcherCount+" didn't respond","High",regToken);
            },15000);
            watcherCount++;
            setTimeout(function(){
                callingWatchers(watcherCount,regToken);
            },5000);
        },15000);
        /setTimeout(function(){
            helpMeStatus = false;
            sendNotification("Watcher Response","Watcher "+watcherCount+" is coming to help you","High",regToken);
        },15000);*/
}

function alertProcesiing(registrationToken,log){
    sendNotification("Alert Received","We're calling your watcher for you!","High",registrationToken);

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
            
            console.log(JSON.stringify(log) + "\n\n" + JSON.stringify(data));

            for(var i = 0 ; i < data.length ; i++){
                //callingWatchers(i,registrationToken,log,data);
            }
            
            //res.send(JSON.stringify(data));
        })
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

    //if(helpMeStatus == false){
        //helpMeStatus = true;
        log.save().then(function(log){

            req.app.io.emit('logInserted', 'Data saved');
    

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
                    
                    console.log(JSON.stringify(log) + "\n\n" + JSON.stringify(data));
                    
                    res.send(log);

                })

            });
    //}
    //else{
        //res.send(log);
        //sendNotification("Alert Received","Help Me Function already activated","High",registrationToken);
    //}

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

    res.send(JSON.stringify("Connection to WOM server is ok1"));
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
    }).then((message) => res.send(JSON.stringify("Request has been sent!")));
});

router.post('/receiveMessage', (req, res) => {
    const twiml = new MessagingResponse();
  
    if (req.body.Body == 'hello') {
      twiml.message('Hi!');
    } else if (req.body.Body == 'bye') {
      twiml.message('Goodbye');
    } else {
      twiml.message(
        'No Body param match, Twilio sends this in the request to your server.'
      );
    }
  
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });

module.exports = router;
