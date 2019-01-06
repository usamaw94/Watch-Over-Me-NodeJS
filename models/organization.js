const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

//create person Schema and model
const organizationSchema = new Schema({
    organization_id: {
        type: String
    },
    organization_name:{
        type: String
    },
    organization_phone:{
        type: String
    },
    organization_email:{
        type: String
    },
    organization_address:{
        type: String
    },
    organization_ref_num:{
        type: String
    },
    is_pharmacy:{
        type: String
    },
    org_primary_contact_name:{
        type: String
    },
    org_secondary_contact_name:{
        type: String
    },
    organization_date:{
        type: String
    },
    organization_time:{
        type: String
    }
}, {collection: 'organizations'});

const organization = mongoose.model('organization',organizationSchema);

module.exports = organization;