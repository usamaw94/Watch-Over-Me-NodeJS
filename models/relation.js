const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create relation Schema and model
const relationSchema = new Schema({
    service_id: {
        type: String
    },
    watcher_id:{
        type: String
    },
    priority_num:{
        type: String
    },
    watcher_status:{
        type: String
    },
    updated_date:{
        type: String
    },
    updated_time:{
        type: String
    }
});

const relation = mongoose.model('relaion',relationSchema);

module.exports = relation;