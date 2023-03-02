const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        require:true
    },
    lname:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    is_verified:{
        type:Number,
        default:0    
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    coupons:{
        type:Array,
        default:null
    },
    cartItems:[
        {
            gameId:{
                type:String,
                required:true,
            },
            userId:{
                type:String,
                required:true
            },
            gameName:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                require:true
            },
            gameCat:{
                type:String,
                required:true
            },
            gameImage:{
                type:Array,
                required:true
            }
        }
    ]

})

module.exports = mongoose.model('User',userSchema);
