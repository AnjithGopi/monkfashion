const mongoose = require('mongoose')

const categoriesSchema = new mongoose.Schema({

        name:{
            type:String,
            required:true,
            unique:true
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
