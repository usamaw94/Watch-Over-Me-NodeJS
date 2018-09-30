const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create user Schema and model
const adminSchema = new Schema({
    _id: {
    type: String,
    },
    admin_email:{
       type: String,
       required: [true,'Email is required']
    },
    admin_name:{
        type: String,
        required: [true,'Name is required']
     },
     admin_password:{
        type: String,
        required: [true,'Password is required']
     },
});

const admin = mongoose.model('admin',adminSchema);

module.exports = admin;