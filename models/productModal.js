const mongoose = require('mongoose')
const {Schema} = mongoose;

const reviewSchema = new mongoose.Schema({
   userId:{
      type:Schema.Types.ObjectId,
      ref:'User',
      required:false
   },
   rating:{
      type:Number,
      required:false
   },
   comment:{
      type:String,
      required:false
   },
   createdOn:{
      type:Date,
      default:Date.now
   }
})
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
     rating:{
         type:Number,
         default:0
     },
     review:{
         type:[reviewSchema],
         required:false
     },
     createdOn:{
        type:Date,
        default:Date.now
     },
     stock:{
        type:Number,
        required:true
     },
     selledQuantity:{
         type:Number,
         default:0
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
