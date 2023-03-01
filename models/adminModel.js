const mongoose = require('mongoose');

const admin = mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
})

const Admin = mongoose.model('Admin',admin);
module.exports = Admin;