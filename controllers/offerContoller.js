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


    }


      const categoriesData = await Categories.find({isDeleted:false})
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


const applyProductOffer  = async (req, res) => {
    try {
        console.log("Apply product offer received")
        console.log(req.body)
        const {productId ,productExpiryDate,productPercentage} = req.body
       if(new Date(productExpiryDate) > new Date()) {
        const product =  new mongoose.Types.ObjectId(productId)
        const productData = await Product.findOne({_id:product}).populate('categoryId')
        let percentage = productData.categoryId.offer.percentage >  parseInt(productPercentage) ? productData.categoryId.offer.percentage :  parseInt(productPercentage)
        productData.offer.percentage = parseInt(productPercentage)
        productData.offer.expiryDate = new Date(productExpiryDate)
        productData.salePrice= productData.regularPrice - (productData.regularPrice *percentage /100)
        const updateProductPrice =  await  productData.save()
        if (updateProductPrice){
            res.status(200).json({success:true,message:"Offer Applied Successfully",salePrice:updateProductPrice.salePrice})
        }else{
            res.status(400).json({success:false,message:"Failed to Apply Offer  "})
        }
    }else{

        res.status(400).json({success:false,message:"Failed Please check the Expiry Date  "})
    }
    } catch (error) {
        console.log(error.message);
    }
};
const productOfferChangestatus = async (req, res) => {
    try {
        console.log("change staus received")
        console.log(req.body)
        const  {productId ,status} = req.body
        let change = status === "true" ? false :true;
        const changeStatus = await Product.findByIdAndUpdate({_id:new mongoose.Types.ObjectId(productId)},{$set:{'offer.status':change}},{new:true})
        if(changeStatus){
            res.status(200).json({success:true,message:"Status changed",status:changeStatus.offer.status})
        }else{
            res.status(400).json({success:false,message:"Failed to Change Status ",status:""})
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadCategoriesOffer = async(req,res)=>{
    try{
        console.log("load Category offer received")
        var search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const categoriesData = await Categories.find({ isDeleted:false,
            $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}}
               
            ]
         } ) .skip(skip)
         .limit(limit);
        const totalCategories = await Categories.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);
        res.render('categoriesOffer',{categories:categoriesData,currentPage: page, search:search,
            totalPages: totalPages})
    }catch(error){
        console.log(error.message)
        res.render('../pages/errorAdmin',{error:error.message})

    }
}

const categoriesOfferChangestatus = async (req, res) => {
    try {
        console.log("Category change staus received")
        console.log(req.body)
        const  {categoryId ,status} = req.body
        let change = status === "true" ? false :true;
        const changeStatus = await Categories.findByIdAndUpdate({_id:new mongoose.Types.ObjectId(categoryId)},{$set:{'offer.status':change}},{new:true})
        // console.log(changeStatus)
        if(changeStatus){
            res.status(200).json({success:true,message:"Status changed",status:changeStatus.offer.status})
        }else{
            res.status(400).json({success:false,message:"Failed to Change Status ",status:""})
        }
    } catch (error) {
        console.log(error.message);
        res.render('../pages/errorAdmin',{error:error.message})

    }
};

const applyCategoryOffer  = async (req, res) => {
    try {
       
        const {categoryId ,categoryExpiryDate,categoryPercentage} = req.body
       
        // // console.log()
        const category =  new mongoose.Types.ObjectId(categoryId)
        // console.log(category)
        const categoryData = await Product.find({categoryId:category})
        const updatedProducts = await Promise.all(categoryData.map(async (data) => {
            const productPercentage = data.offer.percentage || 0;
           
                const greaterOfferPercentage = Math.max(parseInt(categoryPercentage), productPercentage);

                data.salePrice = data.regularPrice - (data.regularPrice * greaterOfferPercentage/ 100);
            
                return data.save();
         
          }));
    console.log("Updated Product :",updatedProducts)

        if (updatedProducts.length > 0){
            const updateOfferInCategory = await Categories.findByIdAndUpdate({_id:new mongoose.Types.ObjectId(categoryId)},{$set:{'offer.percentage':categoryPercentage,'offer.expiryDate':categoryExpiryDate}},{new:true})

            res.status(200).json({success:true,message:"Offer Applied Successfully",offer:categoryPercentage})
        }else{
            res.status(400).json({success:false,message:"Failed to Apply Offer  "})
        }

    } catch (error) {
        console.log(error.message);
    }
};


const exp = require('../functions/offerExpiry')
module.exports = {
    loadProductOffer,
    loadCategoriesOffer,
    applyProductOffer,
    productOfferChangestatus,
    categoriesOfferChangestatus,
    applyCategoryOffer,

}