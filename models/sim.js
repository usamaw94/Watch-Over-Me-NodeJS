const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const simSchema = new Schema({
    sim_id: {
        type: String
    },
    sim_num:{
        type: String
    },
    sim_provider:{
        type: String
    },
    wom_num:{
        type: String
    },
    sim_status:{
        type: String
    },
    sim_date:{
        type: String
    },
    sim_time:{
        type: String
    }
}, {collection: 'sims'});

const sim = mongoose.model('sim',simSchema);

module.exports = sim;