const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const personSchema = new Schema({
    person_id: {
        type: String
    },
    person_first_name:{
        type: String
    },
    person_last_name:{
        type: String
    },
    phone_number:{
        type: String
    },
    email:{
        type: String
    },
    password:{
        type: String
    }
}, {collection: 'persons'});

const person = mongoose.model('person',personSchema);

module.exports = person;