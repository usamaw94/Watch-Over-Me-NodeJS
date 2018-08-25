var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var expressLayouts = require('express-ejs-layouts');
var app = express();

var logger = require('morgan');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://usamaw94:uw123456@ds127342.mlab.com:27342/womdb', {useNewUrlParser: true});
mongoose.Promise = global.Promise;

var mongo = require('mongodb');


//set port
var port;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyparser());
app.use(cors());
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));

app.set('layout', 'layouts/layout');
app.set('view engine', 'ejs');

//routes

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api',require('./routes/api'));

// app.get("/", function(req, res){
//     res.render("index");
// })

app.listen(process.env.PORT || 8000,function() {
    console.log("app running");
})