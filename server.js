var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();

//set port
var port = process.env.PORT || 8000

app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));

app.set('layout', 'layouts/layout');
app.set('view engine', 'ejs');

//routes

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);

// app.get("/", function(req, res){
//     res.render("index");
// })

app.listen(port,function() {
    console.log("app running");
})