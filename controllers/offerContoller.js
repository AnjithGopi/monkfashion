const Order = require("../models/orderModel");
const Product = require("../models/productModal");
const Categories = require("../models/categoriesModal");
const User = require("../models/userModal")
const mongoose = require('mongoose');






const loadProductOffer = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        var search = req.query.search || '';
        var category = req.query.category ||'';
      
        console.log("Search Key :",search)
        let productData = null
        if(req.query.category){
            console.log("Category :",req.query.category)
         productData = await Product.find({categoryId:req.query.category})  .populate('categoryId')
         .skip(skip)
         .limit(limit);
        //     category = categoriesId._id
        console.log("categoryData  ;",productData)
    }else{
         productData = await Product.find({
            isDeleted:false,
            $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}}
               
            ]
        })
            .populate('categoryId')
            .skip(skip)
            .limit(limit);

            console.log("Data ::",productData)

    }


      const categoriesData = await Categories.find({isDeleted:false})
      console.log("caat data ::",categoriesData)
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        res.render('productOffer', {
            products: productData,
            categories:categoriesData,
            currentPage: page,
            totalPages: totalPages,
            search:search,
            category:category
        });
 
    } catch (error) {
        console.log(error.message);
    }
};

const loadCategoriesOffer = async(req,res)=>{
    try{
        var search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const categoriesData = await Categories.find({})  .skip(skip)
         .limit(limit);
        // console.log(categoriesData)
        const totalCategories = await Categories.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);
        res.render('categoriesOffer',{categories:categoriesData,currentPage: page, search:search,
            totalPages: totalPages})
    }catch(error){
        console.log(error.message)
    }
}
const applyProductOffer  = async (req, res) => {
    try {
        console.log("Apply product offer received")
        console.log(req.body)
        const {productId ,productExpiryDate,productPercentage} = req.body
       
        // console.log()
        const product =  new mongoose.Types.ObjectId(productId)
        console.log(product)
        const productData = await Product.findOne({_id:product})
        productData.offer.percentage = parseInt(productPercentage)
        productData.offer.expiryDate = new Date(productExpiryDate)
        productData.salePrice= productData.regularPrice - (productData.regularPrice * parseInt(productPercentage) /100)
        const updateProductPrice =  await  productData.save()
        console.log(productData)
        if (updateProductPrice){
            res.status(200).json({success:true,message:"Offer Applied Successfully",salePrice:updateProductPrice.salePrice})
        }else{
            res.status(400).json({success:false,message:"Failed to Apply Offer  "})
        }

    } catch (error) {
        console.log(error.message);
    }
};
const exp = require('../functions/offerExpiry')
exp.productOfferExpiry
module.exports = {
    loadProductOffer,
    loadCategoriesOffer,
    applyProductOffer
}