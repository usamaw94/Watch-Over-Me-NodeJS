const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const Log = require('../models/log');
var admin = require("firebase-admin");

var serviceAccount = require("C:/Waqas/WOM/WOMProject/womproject-18095-firebase-adminsdk-4facv-ce9129eb22.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://womproject-18095.firebaseio.com"
});

//var registrationToken = "eUppQNG-AC8:APA91bHB5-_BlQlylM514ohDYiOErCDMIm1nfoIRsI33UC4pJL2ajT_ub2CoeY6VfM_i2jan9jrF2cYPQ-8Y3YFRiiF4dwbR8D9yt6uw0g4XEU-ai6at4lied3ggrtXyxYwop-xRWOHVKtb3nS7o270GtCTvQo2Ysw";
var registrationToken = "dSU2iZRfRwI:APA91bEv1jzb6YTDmJ39WbMdV7Dq-5kxFewWw6nl2BSXnGIxNROkCtETl4yeGuD6U0r-Rowl7z_FCF__KkjFWStyWaXhEg2gHKMhSC2UKbKXO0eTFunMqhdKj3nLbNId1DTbwXLl0jMFbA2MJRHbE0Vkfzb2Cg9-zg";
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
    
    console.log(log['registration_token']);
    /*log.save().then(function(log){
        //alertProcesiing();
        res.send(log);
    });*/

});

router.get('/alllogs', function(req,res){
    var query = Log.find().sort('-_id');
    query.exec(function(err,log){
        res.send(log);
    });
})

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

router.post('/connectionCheck', function(req,res){
    
    var count = 0;

    alertProcesiing();
    // var interval = setInterval(function(){
    //     console.log("timmer is working fine: " + count);
    //     if(count >= 5){
    //         clearInterval(interval);
    //     }
    //     count++;
    // },3000);
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
