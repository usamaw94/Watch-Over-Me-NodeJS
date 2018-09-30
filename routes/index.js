const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const Log = require('../models/log');
const Admin = require('../models/admin');
const io = require('../server');

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
            // res.redirect('/');
        } else {
            //var admin = new Admin(JSON.stringify(loginData));
            console.log(loginData.admin_email);
            req.session.adminEmail = loginData.admin_email;
            req.session.adminName = loginData.admin_name;
            res.redirect('/adminHome');
            // res.send(loginData);
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

module.exports = router;