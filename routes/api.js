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


/*var watcherResponses = [
    {
        "service_id": "WOMS00000672",
        "helpme_status": "true",
        "wearer_id": "WOMP00000849",
        "wearer_fname": "Usama",
        "wearer_lname": "Waheed",
        "wearer_phone": "+61403887321",
        "watchers": [
            {
                "_id": "5c0b80c01776ab12c860e535",
                "watcherType": "Responding",
                "priority": "1",
                "watcherId": "WOMP00000850",
                "watcherName": "Waqas Waheed",
                "watcherPhone": "0435533452",
                "response": "false"
            },
            {
                "_id": "5c0b81061776ab12c860e538",
                "watcherType": "Responding",
                "priority": "2",
                "watcherId": "WOMP00000851",
                "watcherName": "Rad Williams",
                "watcherPhone": "0408360203",
                "response": "false"
            },
            {
                "_id": "5c0b81b81776ab12c860e53b",
                "watcherType": "Responding",
                "priority": "3",
                "watcherId": "WOMP00000852",
                "watcherName": "Ali Abbas",
                "watcherPhone": "0435467229",
                "response": "false"
            },
            {
                "_id": "5c0b81e41776ab12c860e53e",
                "watcherType": "Responding",
                "priority": "3",
                "watcherId": "WOMP00000853",
                "watcherName": "Jass Karan",
                "watcherPhone": "0452131229",
                "response": "false"
            }
        ]
    }
];*/



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
})

router.post('/logsprocessing', function(req,res){
    var log = new Log(req.body);
    var regToken = log['registration_token'];
    var serviceId = log['service_id'];

    //res.send(JSON.stringify(log));
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
                    
                    res.send(log);

                    var recNum = "+61" + JSON.stringify(data.watcherPhone).substring(1);
                    var msg = "-\nYour wearer is in trouble contact him/her as soon as possible. \n\nLocation : https://www.google.com/maps/dir//"+log.location_latitude+","+log.location_longitude+"\n\nIf you are responding then reply with 'yes'. If you can't reply with 'no'\n\nRegards\nWOM Team";
                    sendNotification("Connecting watcher","Now contacting watcher "+watcherCount,"High",regToken);
                    twilioClient.messages.create({
                    from: "+61488852471",
                    to: recNum,
                    body: msg
                    }).then(function(){
                        setTimeout(function(){

                        },20000)
                    });


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
    // const twiml = new MessagingResponse();
  
    // if (req.body.Body == 'hello') {
    //   twiml.message('Hi!');
    // } else if (req.body.Body == 'bye') {
    //   twiml.message('Goodbye');
    // } else {
    //   twiml.message(
    //     'No Body param match, Twilio sends this in the request to your server.'
    //   );
    // }
  
    // res.writeHead(200, { 'Content-Type': 'text/xml' });
    // res.end(twiml.toString());

    var sender = req.body.From;
    var msgBody = req.body.Body;

    var serviceId = JSON.stringify(msgBody.substring(0,12).toUpperCase());
    var response = JSON.stringify(msgBody.substring(13).toUpperCase());


    compareWatcherResponse(JSON.stringify(sender),serviceId,response);

    // for(var i = 0 ; i < watcherResponses.length ; i++){
    //     if(serviceId == watcherResponses[i].service_id){
    //         for(var j = 0 ; j < watcherResponses[i].watchers.length ; j++){
    //             var phone = "+61" + watcherResponses[i].watchers[j].watcherPhone.substring(1);
    //             console.log(JSON.stringify(phone));
    //             console.log(JSON.stringify(sender));
    //             if(phone == sender){
    //                 console.log("Compared")
    //                 watcherResponses[i].watchers[j].response = "true";
    //             }
    //         }
    //     }
    // }

    // console.log(JSON.stringify("Message from : "+sender+"\nSaying : "+msgBody));
    // console.log(JSON.stringify(msgBody.substring(0,12).toUpperCase()));
    // console.log(JSON.stringify(msgBody.substring(13).toUpperCase()));
    // console.log(JSON.stringify(watcherResponses));
    res.send(JSON.stringify("Message from : "+sender+"\nSaying : "+msgBody));

  });


  router.post('/helpmecheck', function(req,res){
    var log = new Log(req.body);
    var regToken = log['registration_token'];
    var serviceId = log['service_id'];

    //res.send(JSON.stringify(log));
    //if(helpMeStatus == false){
        //helpMeStatus = true;
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
                            res.send(watcherResponses);
                            callingWatchers(0,regToken,log,temp);
                        },5000)
                            
                        //res.send(watcherResponses);
                })
            })

        });
    //}
    //else{
        //res.send(log);
        //sendNotification("Alert Received","Help Me Function already activated","High",registrationToken);
    //}

});

function compareWatcherResponse(senderNum,serviceNum,response){

    if(response == YES){
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
    var nextCall = true; 
    var wCount = i+1;
    var recNum = "+61" + tempData.watchers[i].watcherPhone.substring(1);
    console.log("Watcher "+ wCount + " called");
    var msg = "-\nYour wearer is in trouble contact him/her as soon as possible. \n\nLocation : https://www.google.com/maps/dir//"+log.location_latitude+","+log.location_longitude+"\n\nIf you are responding then reply with 'yes'. If you can't reply with 'no'\n\nRegards\nWOM Team";
    sendNotification("Connecting watcher","Now contacting watcher " + wCount,"High",regToken);

    //////
    setTimeout(function(){
        console.log(JSON.stringify(watcherResponses));
        for(var c = 0 ; c < watcherResponses.length ; c++){
            if(JSON.stringify(watcherResponses[c].service_id) == JSON.stringify(log.service_id)){
                for(var j = 0 ; j < watcherResponses[c].watchers.length ; j++){
                    if(JSON.stringify(watcherResponses[c].watchers[j].response) == "true"){
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
            }
            setTimeout(function(){
                callingWatchers(i,regToken,log,tempData);
            },5000)
        }
        else{
            sendNotification("Connecting watcher","Watcher " +responseIndex+ " is coming to help you","High",regToken);
        }
            
    },20000)
    
    
    
    
    
    
    /*twilioClient.messages.create({
        from: "+61488852471",
        to: recNum,
        body: msg
    }).then(function(){
        setTimeout(function(){
            sendNotification("Connecting watcher","Watcher " +wCount+ " didn't respond","High",regToken);
                i++;
                if(i<data.length){
                    setTimeout(function(){
                        callingWatchers(i,regToken,log,data);
                    },5000)
                }
        },20000)
    });*/
}


module.exports = router;
