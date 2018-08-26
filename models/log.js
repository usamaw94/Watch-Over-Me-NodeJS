const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create user Schema and model
const logSchema = new Schema({
    service_id: {
        type: String
    },
    log_date:{
        type: String
    },
    log_time:{
        type: String
    },
    log_text:{
        type: String
    },
    log_type:{
        type: String
    },
    location_latitude:{
        type: String
    },
    location_longitude:{
        type: String
    },
    battery_percentage:{
        type: String
    },
    registration_token:{
        type: String
    }
});

const log = mongoose.model('log',logSchema);

module.exports = log;