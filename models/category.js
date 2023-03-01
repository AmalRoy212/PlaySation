const mongoose = require('mongoose');

const category = mongoose.Schema({
    gameCategory:{
        type:String,
        require:true
    }
})
const Category = mongoose.model('Category',category);
module.exports = Category