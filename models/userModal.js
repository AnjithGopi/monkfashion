const mongoose = require('mongoose');
const {Schema} = mongoose;


const addressSchema = new mongoose.Schema({
   fullName: {
      type:String,
      required:true
   },
   phone:{
      type:Number,
      required:true
   },
   phone2:{
      type:Number,
      required:false
   },
   houseName:{
      type:String,
      required:true
   }, 
   state:{
      type:String,
      required:true
   },
   city:{
      type:String,
      required:true
   },
   pincode:{
      type:Number,
      required:true
   },
   landMark:{
      type:String,
      required:false
   }

})


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
      isAdmin:{
         type:Boolean,
         required:false,
         default:false
     },
     isActive:{
      type:Boolean,
      required:false,
      default:true
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
      type:[addressSchema],
      required:false
    },
    cart:{
      type:Schema.Types.ObjectId,
      ref:"cart",
      required:false 
    },
    dob:{
      type:String,
      required:false
    },
    otp:{
      type:Number,
      required:false
    },
   referralId: {
      type:String,
      required:false
   }
    
});


module.exports =mongoose.model('User',userSchema);
