const mongoose = require('mongoose')

const categoriesSchema = new mongoose.Schema({

        name:{
            type:String,
            required:true
        },
        is_active:{
            type:Number,
            default:1
        }
})

module.exports =mongoose.model('Categories',categoriesSchema);
