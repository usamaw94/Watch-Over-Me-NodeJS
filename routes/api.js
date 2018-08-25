const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const Log = require('../models/log');
var admin = require("firebase-admin");

var serviceAccount = require("../womproject-18095-firebase-adminsdk-4facv-ce9129eb22.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://womproject-18095.firebaseio.com"
});

var registrationToken;
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

function callingWatchers(watcherCount){

    sendNotification("Connecting watcher","Now contacting watcher "+watcherCount,"High",registrationToken);
    if(watcherCount < 5){
        setTimeout(function(){
            setTimeout(function(){
                sendNotification("Watcher Response","Watcher "+watcherCount+" didn't respond","High",registrationToken);
            },15000);
            watcherCount++;
            setTimeout(function(){
                callingWatchers(watcherCount);
            },5000);
        },15000);
    }
    else{
        setTimeout(function(){
            sendNotification("Watcher Response","Watcher "+watcherCount+" is coming to help you","High",registrationToken);
        },15000);
    }
}

function alertProcesiing(){
    sendNotification("Alert Received","We're calling help for you!","High",registrationToken);
    setTimeout(function(){
        callingWatchers(1);
    },3000);
}

router.post('/logsprocessing', function(req,res){
    var log = new Log(req.body);
    
    registrationToken = log['registration_token'];

    log.save().then(function(log){
        alertProcesiing();
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
            res.send(JSON.stringify('Logs inserted'));
        }
    });
});

router.get('/connectionCheck', function(req,res){
    
    var count = 0;

    res.send("Hello");
    sendNotification("Alert received","We are calling help for you!","High","eUppQNG-AC8:APA91bHB5-_BlQlylM514ohDYiOErCDMIm1nfoIRsI33UC4pJL2ajT_ub2CoeY6VfM_i2jan9jrF2cYPQ-8Y3YFRiiF4dwbR8D9yt6uw0g4XEU-ai6at4lied3ggrtXyxYwop-xRWOHVKtb3nS7o270GtCTvQo2Ysw");
});

router.post('/hourlylogsprocessing', function(req,res){
    var log = new Log(req.body);
    log.save().then(function(log){
            res.send(JSON.stringify('Hourly Log Inserted'));
    });
});

router.post('/contactsprocessing', function(req,res){
    var contact = new Contact(req.body);
    contact.save();

    Contact.create(req.body).then(function(contact){
      res.send(contact);
    });
});


module.exports = router;
