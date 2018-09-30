var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var expressLayouts = require('express-ejs-layouts');
var expressSession = require('express-session');

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
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false}));
app.use(cors());
app.use(expressLayouts);
app.use(expressSession({
    secret: 'max',
    saveUninitialized: true,
    resave: false
}));
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



const server = app.listen(process.env.PORT || 5000,function() {
    console.log("app running");
});

const io = require('socket.io')(server);

app.io = io;

io.on('connection',(socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

module.exports = io;