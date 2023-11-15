const mongoose = require('mongoose')
const {Schema} = mongoose;
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        default:1
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
     }
    

})


module.exports =mongoose.model('Product',productSchema);
