const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const personSchema = new Schema({
    person_id: {
        type: String
    },
    person_full_name:{
        type: String
    }
}, {collection: 'persons'});

const person = mongoose.model('person',personSchema);

module.exports = person;