const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const Log = require('../models/log');
const io = require('../server');

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

module.exports = router;