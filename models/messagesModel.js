const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({

        name:{
            type:String,
            required:true,
            unique:true
        }, 
        email:{
            type:String,
            require:true
        } ,
        mobile:{
            type:Number,
            required:false
        },
        subject:{
            type:String,
            required:false,
        },
        content:{
            type:String,
            required:false, 
        },
         createdDate:{
         type:Date,
         default:Date.now  
        },
       
})

module.exports =mongoose.model('Message',messageSchema);