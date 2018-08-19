const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// set up app
const app = express();

// connect to mongodb
mongoose.connect('mongodb://usamaw94:uw123456@ds127342.mlab.com:27342/womdb', { useNewUrlParser: true });
mongoose.Promise = global.Promise;


app.use(bodyParser.json());

// initialize the routes
app.use('/api',require('./routes/api'));

// listen to the port
app.listen(process.env.port || 4000,function(){
    console.log("App ready to listen to requests")
});