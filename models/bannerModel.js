const mongoose = require('mongoose');

const banner = mongoose.Schema({
    image:{
        type:Array,
        require:true
    }
})

const Banner = mongoose.model('Banner',banner);
module.exports = Banner;