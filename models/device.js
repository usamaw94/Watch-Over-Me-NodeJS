const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const deviceSchema = new Schema({
    device_id: {
        type: String
    },
    device_imei:{
        type: String
    },
    device_manufacturer:{
        type: String
    },
    device_model:{
        type: String
    },
    device_year:{
        type: String
    },
    device_status:{
        type: String
    },
    device_date:{
        type: String
    },
    device_time:{
        type: String
    }
}, {collection: 'devices'});

const device = mongoose.model('device',deviceSchema);

module.exports = device;