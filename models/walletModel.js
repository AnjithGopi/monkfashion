const mongoose = require('mongoose')

const {Schema} = mongoose;

const walletSchema = new mongoose.Schema({

    userId:{
        type:Schema.Types.ObjectId,
        required:true 
     },
    balance:{
        type:Number,
        default:0
    },
    transaction:[
      {  amount:{
            type:Number,
            requied:false
        },
        mode:{
            type:String,
            enum:['Credited','Debited'],
            requied:false
        },
        createdOn:{
            type:Date,
            default:Date.now()
        }
     }
    ]
    
     
})

module.exports = mongoose.model('Wallet',walletSchema)