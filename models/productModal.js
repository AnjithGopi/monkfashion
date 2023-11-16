const mongoose = require('mongoose')
const {Schema} = mongoose;
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    is_deleted:{
        type:Number,
        default:0
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
     is_active:{
      type:Number,
      default:1
     }
    

})


module.exports =mongoose.model('Product',productSchema);
