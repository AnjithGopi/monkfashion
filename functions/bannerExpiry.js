const Banner = require('../models/bannerModal')
const schedule = require('node-schedule')


const bannerExpiry =  schedule.scheduleJob('*/2 * * * * *',async ()=>{
    // console.log("schedular  Product offer expiry ")

    try {
        const result = await Banner.updateMany(
            {
                expiryDate: { $lte: new Date() }
                       
            },
            { $set: { isActive:false  }
            
             }
        );
      
        // console.log(result)
    
    
    } catch (error) {
        console.log(error.message) 
    }
})
module .exports = {bannerExpiry }
