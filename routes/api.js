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
const smsapi = require('../models/clickApi');

// const io = require('../server');

// var socket = io.connect('http://localhost:5000');

var serviceAccount = require("../womproject-18095-firebase-adminsdk-4facv-ce9129eb22.json");

var watcherResponses = [];

var helpMeStatus = false;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://womproject-18095.firebaseio.com"
});

router.get('/helpMeRespond',function(req,res){
    res.render("helpMeRespond", { title: 'Watch Over Me - Respond', data : 'some text' });
});

router.get('/checkSms', function(req,res){
 
    var smsMessage = new smsapi.SmsMessage();
 
    smsMessage.from = "+61435533452";
    smsMessage.to = "+61408360203";
    smsMessage.body = "test message";
 
    var smsApi = new smsapi.SMSApi("waqax94", "4B9FAA7D-8EA6-4090-4F2A-B311EF7536A3");
 
    var smsCollection = new smsapi.SmsMessageCollection();
 
    smsCollection.messages = [smsMessage];
 
    smsApi.smsSendPost(smsCollection).then(function(response) {
        console.log(response.body);
    }).catch(function(err){
        console.error(err.body);
    });
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
                            console.log(serviceData.service_id + "/" + userData.person_first_name + " " + userData.person_last_name);
                            res.send(JSON.stringify(serviceData.service_id + "/" + userData.person_first_name + " " + userData.person_last_name));
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
            req.app.io.emit('logInserted',hourlyLogs['service_id']);

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

        req.app.io.emit('logInserted',log['service_id']);

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

    for(var hCount = 0 ; hCount < watcherResponses.length ; hCount ++){
        if(serviceId == watcherResponses[hCount].service_id){
            helpMeStatus = true;
        }
    }

    if(helpMeStatus == false){
        log.save().then(function(log){

            req.app.io.emit('logInserted',log['service_id']);


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
                            
                            callingWatchers(0,1,regToken,log,temp);
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

function callingWatchers(i,cycle,regToken,log,tempData){

    var responseIndex = -1;
    var removeIndex = -1;
    var nextCall = true; 
    var wCount = i+1;
    var recNum = "+61" + tempData.watchers[i].watcherPhone.substring(1);
    console.log("Watcher "+ wCount + " called");
    var reply = tempData.service_id + " yes";
    reply.link("#");
    var msg = "Attention " + tempData.watchers[i].watcherName + "\nYour Wearer, " + tempData.wearer_fname +" "+ tempData.wearer_lname +", has pressed the HelpMe button and needs assistance at their location.\n\nYou are Watcher " + wCount + " of " + tempData.watchers.length + " for " + tempData.wearer_fname + " on Service ID: \n" + tempData.service_id + "link";
    sendNotification("Connecting watcher","Now contacting watcher " + wCount,"High",regToken);


    console.log("Cycle: "+ cycle);
    if(cycle < 2){
        twilioClient.messages.create({
            from: "+61488852471",
            to: recNum,
            body: msg
        }).then(function(){
            twilioClient.calls.create({
                url: 'https://handler.twilio.com/twiml/EH188dc109e62c15bb744484fa84b0f08c',
                to: recNum,
                from: "+61488852471"
            }).then((call) => console.log(JSON.stringify("Call has been sent!")));
            setTimeout(function(){
                console.log(JSON.stringify(watcherResponses));
                for(var c = 0 ; c < watcherResponses.length ; c++){
                    if(watcherResponses[c].service_id == log.service_id){
                        removeIndex = c;
                        for(var j = 0 ; j < watcherResponses[c].watchers.length ; j++){
                            if(watcherResponses[c].watchers[j].response == 'true'){
                                console.log("There");
                                nextCall = false;
                                responseIndex = j;
                                break;
                            }
                        }
                    }
                }
    
                i++;
                if (nextCall == true){
                    sendNotification("Connecting watcher","Watcher " +wCount+ " didn't respond","High",regToken);
                    if(i == tempData.watchers.length){
                        i = 0;
                        cycle++;
                    }
                    setTimeout(function(){
                        console.log("Calling again");
                        callingWatchers(i,cycle,regToken,log,tempData);
                    },5000)
                }
                else{
                    var watcherNum = responseIndex+1
                    if(responseIndex != -1){
                        sendNotification("Connecting watcher","Watcher " + watcherNum + "  responded with YES","High",regToken);
                    }
                    delete watcherResponses[removeIndex];
                    watcherResponses = watcherResponses.filter(function(x){
                        return (x !== (undefined || null || ''));
                    });
                    console.log(JSON.stringify(watcherResponses));
                }
            },30000)
        });
    }
    else if (cycle == 2){

        sendNotification("Connecting watcher","Watcher " +wCount+ " didn't respond","High",regToken);


        twilioClient.calls.create({
        url: 'https://handler.twilio.com/twiml/EH188dc109e62c15bb744484fa84b0f08c',
        to: recNum,
        from: "+61488852471"
        }).then((call) => console.log(JSON.stringify("Call 2 has been sent!")));
        setTimeout(function(){
            console.log(JSON.stringify(watcherResponses));
            for(var c = 0 ; c < watcherResponses.length ; c++){
                if(watcherResponses[c].service_id == log.service_id){
                    removeIndex = c;
                    for(var j = 0 ; j < watcherResponses[c].watchers.length ; j++){
                        if(watcherResponses[c].watchers[j].response == 'true'){
                            console.log("There");
                            nextCall = false;
                            responseIndex = j;
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
                    cycle++;
                }
                setTimeout(function(){
                    callingWatchers(i,regToken,log,tempData);
                },5000)
            }
            else{
                var watcherNum = responseIndex+1
                if(responseIndex != -1){
                    sendNotification("Connecting watcher","Watcher " + watcherNum + "  responded with YES","High",regToken);
                }
                delete watcherResponses[removeIndex];
                watcherResponses = watcherResponses.filter(function(x){
                    return (x !== (undefined || null || ''));
                });
                console.log(JSON.stringify(watcherResponses));
            }
        },30000)

    }
    else {
        sendNotification("Wearerfistname,\nYOU SHOULD IMMEDIATELY TAKE STEPS TO GET ATTENTION BY OTHER MEANS.\n\nNone of your watchers have said they can visit you after two cycles of contact attempts from WOM Team.\n\nYour watchers have been informed that there is no Responding Watcher appointed to your HelpMe request and that they should check in on you, if they can.\n\nWe hope you are OK.\n\WOM Team","High",regToken);
    }
}
router.get('/helpmeresponse/:serviceNum/:date/:time',function(req,res){
    console.log(JSON.stringify(req.param.serviceNum + "\n" + req.param.date + "\n" + req.param.time));
});


//for (var l = 0 ; l < watcherResponses[removeIndex].watchers.length ; l++){
    //     if(l != responseIndex){
    //         var senderNum = "+61" + watcherResponses[removeIndex].watchers[l].watcherPhone.substring(1);
    //         var infomsg = "Watcher "+watcherNum+" "+watcherResponses[removeIndex].watchers[responseIndex].watcherName+", responded with yes and he is going to assist "+watcherResponses[removeIndex].wearer_fname+"\n\nRegards\nWOM Team";
    //         twilioClient.messages.create({
    //             from: "+61488852471",
    //             to: senderNum,
    //             body: infomsg
    //         }).then(function(){
    //             console.log("Message Sent");
    //         })
    //     }
    // }

//end
module.exports = router;
