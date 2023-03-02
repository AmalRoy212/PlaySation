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
    isActive:{
        type:Boolean,
        default:true
    },
    isCommon:{
        type:Boolean,
        default:false
    },
    send:{
        type:Array,
        default:null
    },
    users:{
        type:Array,
        default:null
    }
})

const Coupon = mongoose.model('Coupon',coupon);
module.exports = Coupon;