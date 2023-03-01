const mongoose = require('mongoose');

const coupon = mongoose.Schema({
    couponCode:{
        type:String,
        require:true
    },
    couponDiscount:{
        type:Number,
        rquired:true
    },
    createdON:{
        type:String,
        require:true
    },
    expDate:{
        type:String,
        require:true
    },
    availability:{
        type:String,
        require:true
    },
    minAmount:{
        type:Number,
        require:true
    },
    users:{
        type:Array,
        default:null
    }
})

const Coupon = mongoose.model('Coupon',coupon);
module.exports = Coupon;