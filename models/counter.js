const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const counterSchema = new Schema({
    
    counter_seq_name: {
        type: String
    },
    counter_seq_num: {
        type: Number,default:765
    }
});

const counter = mongoose.model('counter',counterSchema);

module.exports = counter;