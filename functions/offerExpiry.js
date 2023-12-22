const Product = require('../models/productModal')
const Categories = require('../models/categoriesModal')
const schedule = require('node-schedule')


const productOfferExpiry =  schedule.scheduleJob('*/2 * * * * *',async ()=>{
    // console.log("Job  .. ")
    try {
        const result = await Product.updateMany(
            {
                'offer.expiryDate': { $lte: new Date() },
                
            },
            { $set: { 'offer.status':false  } }
        );
        // console.log(result)
    
    
        if (result.nModified > 0) {
            console.log('Expired Offers  successfully.');
        } else {
            // console.log('No expired coupons found.');
        }
    } catch (error) {
        console.log(error.message)
    }
})
module .exports = {productOfferExpiry}
