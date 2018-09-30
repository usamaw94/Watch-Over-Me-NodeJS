const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const personDetailSchema = new Schema({
    person_id: {
        type: String
    },
    phone_number:{
        type: String
    },
    email:{
        type: String
    },
    update_date:{
        type: String
    },
    update_time:{
        type: String
    }
});

const personDetail = mongoose.model('personDetail',personDetailSchema);

module.exports = personDetail;