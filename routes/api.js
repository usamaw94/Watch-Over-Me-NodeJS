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

var watcherResponses = [];

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

    res.send(JSON.stringify("Connection to WOM server is ok!"));
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

    var sender = req.body.From;
    var msgBody = req.body.Body;

    var serviceId = JSON.stringify(msgBody.substring(0,12).toUpperCase());
    var response = msgBody.substring(13).toUpperCase();

    compareWatcherResponse(JSON.stringify(sender),serviceId,response);

    const twiml = new MessagingResponse();
  

    twiml.message('Thanks for you respone. \nYour wearer will be informed\n\n\nRegards\nWOM Team');
  
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });


  router.post('/helpmecheck', function(req,res){
    var log = new Log(req.body);
    var regToken = log['registration_token'];
    var serviceId = log['service_id'];
    var helpMeStatus = false;

    if(watcherResponses != [null]){
        for(var hCount = 0 ; hCount < watcherResponses.length ; hCount ++){
            if(serviceId == watcherResponses[hCount].service_id){
                helpMeStatus = true;
            }
        }   
    }

    if(helpMeStatus == false){
        log.save().then(function(log){

            req.app.io.emit('logInserted', 'Data saved');


            var wr = Service.aggregate([
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
                    },
                },
                {
                    $project:
                    {
                        wearerId : '$wearer_id',
                        wearerFName : { "$arrayElemAt": [ "$wearerInfo.person_first_name", 0 ] },
                        wearerLName : { "$arrayElemAt": [ "$wearerInfo.person_last_name", 0 ] },
                        wearerPhone : { "$arrayElemAt": [ "$wearerInfo.phone_number", 0 ] },
                    }
                }

            ])
    
            wr.exec(function(err,wrData){

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
                            watcherPhone : { "$arrayElemAt": [ "$watcherInfo.phone_number", 0 ] },
                            response: 'false',
                        }
                    }
                    ])
            
                w.exec(function(err,watchers){
                        
                        sendNotification("Alert Received","We're calling your watcher for you!","High",regToken);
                        setTimeout(function(){
                            var temp = new Object();
                            temp["service_id"] = log.service_id;
                            temp["helpme_status"] = 'true';
                            temp["wearer_id"] = wrData[0].wearerId;
                            temp["wearer_fname"] = wrData[0].wearerFName;
                            temp["wearer_lname"] = wrData[0].wearerLName;
                            temp["wearer_phone"] = "+61" + wrData[0].wearerPhone.substring(1);
                            temp["watchers"] = watchers;
                            watcherResponses.push(temp);
                            
                            callingWatchers(0,regToken,log,temp);
                        },5000)
                            
                        res.send(JSON.stringify("Help Me function activated!"));
                })
            })

        });
    }
    else{
        res.send(JSON.stringify("Help Me function already active!"));
    }

});

function compareWatcherResponse(senderNum,serviceNum,response){

    if(response === 'YES'){
        console.log(response);
        for(var i = 0 ; i < watcherResponses.length ; i++){
            if(JSON.stringify(watcherResponses[i].service_id) == serviceNum){
                for(var j = 0 ; j < watcherResponses[i].watchers.length ; j++){
                    var phone = "+61" + watcherResponses[i].watchers[j].watcherPhone.substring(1);
                    if(JSON.stringify(phone) == senderNum){
                        watcherResponses[i].watchers[j].response = "true";

                        console.log(JSON.stringify(watcherResponses));
                    }
                }
            }
        }
    }

}

function callingWatchers(i,regToken,log,tempData){

    var responseIndex = -1;
    var removeIndex = -1;
    var nextCall = true; 
    var wCount = i+1;
    var recNum = "+61" + tempData.watchers[i].watcherPhone.substring(1);
    console.log("Watcher "+ wCount + " called");
    var reply = tempData.service_id + " yes";
    reply.link("#");
    var msg = "Your Wearer, " + tempData.wearer_fname +" "+ tempData.wearer_lname +", has pressed the HelpMe button and needs assistance at their location.\n\nYou are Watcher " + wCount + " of " + tempData.watchers.length + "\n\n Service Number: " + tempData.service_id + "\n\nLocation : https://www.google.com/maps/dir//"+log.location_latitude+","+log.location_longitude+"\n\nIf you will visit "+ tempData.wearer_fname +" and assist then reply with this text: \n\n"+ reply +"\n\nIf you will not visit "+ tempData.wearer_fname +" then ignore this sms. Any other response rather than the above will be consider as No.\n\nNext watcher will be contacted if we don't receive a response from you.\n\nWe will tell you which Watcher is visiting "+tempData.wearer_fname+", or if no Watcher is available to visit.\n\n\nRegards\nWOM Team";
    sendNotification("Connecting watcher","Now contacting watcher " + wCount,"High",regToken);

    twilioClient.messages.create({
        from: "+61488852471",
        to: recNum,
        body: msg
    }).then(function(){
        setTimeout(function(){
            console.log(JSON.stringify(watcherResponses));
            for(var c = 0 ; c < watcherResponses.length ; c++){
                if(watcherResponses[c].service_id == log.service_id){
                    for(var j = 0 ; j < watcherResponses[c].watchers.length ; j++){
                        if(watcherResponses[c].watchers[j].response == 'true'){
                            console.log("There");
                            nextCall = false;
                            responseIndex = j;
                            removeIndex = c;
                            break;
                        }
                    }
                }
            }

            i++;
            if (nextCall == true && i < tempData.watchers.length){
                sendNotification("Connecting watcher","Watcher " +wCount+ " didn't respond","High",regToken);
                if(i == tempData.watchers.length){
                    i = 0;
                }
                setTimeout(function(){
                    callingWatchers(i,regToken,log,tempData);
                },5000)
            }
            else{
                var watcherNum = responseIndex+1
                sendNotification("Connecting watcher","Watcher " + watcherNum + "  responded with YES","High",regToken);
                for (var l = 0 ; l < watcherResponses[removeIndex].watchers.length ; l++){
                    if(l != responseIndex){
                        var senderNum = "+61" + watcherResponses[removeIndex].watchers[l].watcherPhone.substring(1);
                        var infomsg = "Watcher "+watcherNum+" "+watcherResponses[removeIndex].watchers[responseIndex].watcherName+", responded with yes and he is going to assist "+watcherResponses[removeIndex].wearer_fname+"\n\nRegards\nWOM Team";
                        twilioClient.messages.create({
                            from: "+61488852471",
                            to: senderNum,
                            body: infomsg
                        }).then(function(){
                            console.log("Message Sent");
                        })
                    }
                }
                delete watcherResponses[removeIndex];
                console.log(JSON.stringify(watcherResponses));
            }
        },20000)
    });
}

//end
module.exports = router;
