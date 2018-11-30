const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const serviceSchema = new Schema({
    service_id: {
        type: String
    },
    wearer_id:{
        type: String
    },
    wom_num:{
        type: String
    },
    customer_id:{
        type: String
    },
    pharmacy_id:{
        type: String
    },
    service_reg_date:{
        type: String
    },
    service_reg_time:{
        type: String
    },
    status:{
        type: String
    }
});

const service = mongoose.model('service',serviceSchema);

module.exports = service;