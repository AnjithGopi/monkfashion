const Product = require('../models/productModal')
const Categories = require('../models/categoriesModal')
const schedule = require('node-schedule')


const productOfferExpiry =  schedule.scheduleJob('*/2 * * * * *',async ()=>{
    // console.log("schedular  Product offer expiry ")

    try {
        const result = await Product.updateMany(
            {
                'offer.expiryDate': { $lte: new Date() }
                       
            },
            { $set: { 'offer.status':false,'offer.percentage':0  }
            
             }
        );
        const result1 = await Product.updateMany(
            {
                'offer.expiryDate': { $gte: new Date() }
                       
            },
            { $set: { 'offer.status':true  }
            
             }
        );
        // console.log(result)
    
    
        if (result.modifiedCount > 0) {
            console.log('Expired Offers  successfully.');
     
            await applyOfferFunction(); 
    // }
        } else {
            // console.log('No expired coupons found.');
        }
    } catch (error) {
        console.log(error.message) 
    }
})


const categoriesOfferExpiry =  schedule.scheduleJob('*/2 * * * * *',async ()=>{
    // console.log("schedular  category offer expiry ")
    try {
        const result = await Categories.updateMany(
            {
                'offer.expiryDate': { $lte: new Date() }
                       
            },
            { $set: { 'offer.status':false,'offer.percentage':0  }
            
             }
        );
        const result1 = await Categories.updateMany(
            {
                'offer.expiryDate': { $gte: new Date() }
                       
            },
            { $set: { 'offer.status':true }
            
             }
        );
        // console.log(result)
    
    
        if (result.modifiedCount > 0) {
            // console.log('Expired Offers  successfully.');
           
            await applyOfferFunction(); 
    // }
        } else {
            // console.log('No expired coupons found.');
        }
    } catch (error) {
        console.log(error.message) 
    }
})

async function applyOfferFunction() {
    try {
        const allProducts = await Product.find().populate('categoryId');

        for (const product of allProducts) {
            if (product.categoryId) {
                const category = product.categoryId;

                const greaterOfferPercentage = Math.max(
                    category.offer ? category.offer.percentage : 0,
                    product.offer ? product.offer.percentage : 0
                );

          
                product.salePrice = product.regularPrice - (product.regularPrice * greaterOfferPercentage / 100);

                // Save the product to persist the changes
                await product.save();

                console.log(`Applied offer for product with ID: ${product._id}`);
            } else {
                console.log(`Product with ID ${product._id} does not have a category.`);
            }
        }

        // console.log('Applied offer for all products successfully.');
    } catch (error) {
        console.error(`Error applying offer for all products: ${error.message}`);
    }
}

module .exports = {productOfferExpiry,categoriesOfferExpiry }
