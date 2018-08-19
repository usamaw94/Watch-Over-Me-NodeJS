const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create user Schema and model
const contactSchema = new Schema({
    contact_id: {
    type: String,
    },
    full_name:{
       type: String,
       required: [true,'Name is required']
    },
    dob:{
        type: String
    }
});

const contact = mongoose.model('contact',contactSchema);

module.exports = contact;