const mongoose = require('mongoose');

const games = mongoose.Schema({
    image:{
       type:Array,
       require:true
    },
    video:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    downloads:{
        type:Number,
        default:0
    },
    category:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    designers:{
        type:String,
        require:true
    },
    developed:{
        type:String,
        require:true
    },
    publisher:{
        type:String,
        require:true
    },
    dis:{
        type:String,
        require:true
    },
    deleted:{
        type:Boolean,
        default:false
    },
    isDownload:{
        type:Boolean,
        default:false
    },
    inCart:{
        type:Boolean,
        default:false
    },
    gameVersions:[
        {
            version:{
                type:String,
                require:true
            },
            dateOfVersion:{
                type:String,
                require:true
            },
            platform:{
                type:String,
                require:true
            },
            aboutGame:{
                type:String,
                require:true
            },
            versionDetails:{
                type:String,
                require:true
            }
        }
    ]
})
const Games = mongoose.model('Game',games);
module.exports = Games