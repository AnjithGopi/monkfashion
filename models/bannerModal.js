const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({

        name:{
            type:String,
            required:true
        
        },  
        text:{
            type:String,
            required:false,
           
        },
        text2:{
            type:String,
            required:false, 
        },
        image:{
            type:Array,
            required:true
        },
        target:{
            type:String,
            required:false
        },
        isActive:{
            type:Boolean,
            default:true
        },
         expiryDate:{
         type:Date,
         default:Date.now  
        },
        index:{
            type:Number,
            default:0
        }
       
})

module.exports =mongoose.model('Banner',bannerSchema);