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


const orderSchema = new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true 
     },
     items:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            productStatus:{
               type:String,
               enum:['Order Placed','Cancelled','Returned'],
               default:'Order Placed'
            },reason:{
               type:String,
               required:false
            },cancelledQuantity:{
               type:Number,
               required:false
            }
        }
     ],
     address:{
        type:[addressSchema],
        required:true
      },
     paymentMethod:{
        type:String,
        required:true
     },
      orderStatus:{
        type:String,
        enum:['Order Placed','Confirmed','Shipped','Delivered','Cancelled','Returned'],
        default:'Order Placed'
     },
     paymentStatus:{
        type:String,
        enum:['Pending','Success','Failed'],
        default:'Pending'
     },
     orderDate:{
        type: Date,
        default: Date.now  
    },
    orderId:{
      type:String,
      required:true
    },
    totalAmount:{
      type:Number,
      default:0
    }
       
});


module.exports =mongoose.model('Order',orderSchema);
