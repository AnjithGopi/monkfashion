const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
     },
     mobile:{
        type:Number,
        required:true
     },
     password:{
        type:String,
        required:true
     } ,
      is_admin:{
        type:Number,
        required:false,
        default:0
     },
     is_active:{
        type:Number,
        default:1
     } ,
      wallet:{
        type:Number,
        required:false,
        default:0
     },
     createdTime: {
        type: Date,
        default: Date.now  
    },
    wishlist:{
      type:Array,
      required:false
    },
    address:{
      type:Array,
      required:false
    },
    cart:{
      type:Array,
      required:false
    }
});

module.exports =mongoose.model('User',userSchema);
