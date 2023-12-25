const mongoose = require('mongoose')

const categoriesSchema = new mongoose.Schema({

        name:{
            type:String,
            required:true,
            unique:true
        },
        offer:{
            percentage:{
               type:Number,
               default:0
            },
            expiryDate:{
               type:Date,
           default:Date.now
   
            },
            status:{
               type:Boolean,
               default:true
            }
        },
        isActive:{
            type:Boolean,
            default:true
        },
        isDeleted:{
            type:Boolean,
            default:false
        }
})

module.exports =mongoose.model('Categories',categoriesSchema);
