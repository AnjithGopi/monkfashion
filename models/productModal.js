const mongoose = require('mongoose')
const {Schema} = mongoose;
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
     },
     image:{
      type:Array,
      required:true
     },
     categoryId:{
        type:Schema.Types.ObjectId,
        ref:'Categories',
        required:true 
     },
     regularPrice:{
        type:Number,
        required:true
     },
     salePrice:{
        type:Number,
        required:true
     },
     createdOn:{
        type:Date,
        default:Date.now
     },
     stock:{
        type:Number,
        required:true
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


module.exports =mongoose.model('Product',productSchema);
