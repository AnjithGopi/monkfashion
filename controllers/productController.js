const Product = require('../models/productModal')
const Categories = require('../models/categoriesModal')
const sharp = require('sharp')
const path = require('path');
const { DefaultDeserializer } = require('v8')

const loadAddProduct = async (req,res)=>{
    try{
        const categoriesData = await Categories.find({isDeleted:false})
        res.render('add-product',{categories:categoriesData})
    }catch(error){
        res.render('../pages/errorAdmin',{error:error.message})
        console.log(error.message)
    }
}

const insertProduct  =  async (req,res)=>{
    try{
        const searchProduct = await Product.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') })

        const productData = await Categories.find({isDeleted:false})
        const categoriesId = await Categories.findOne({name:req.body.categories})
        if(searchProduct){
            res.render('add-product',{message: '1',categories:productData})

        }else{
            const newImages = [];
            if (req.files && req.files.length > 0) {
            
                for (const file of req.files) {
                    const filename = file.filename;
            
                    // Use Sharp to crop the image (adjust the crop options as needed)
                    const croppedImageBuffer = await sharp(file.path)
                        .resize({ width: 500, height: 500, fit: 'cover' }) // Example cropping options
                        .toBuffer();
            
                    const croppedFilename = `cropped_${filename}`;
            
                    const outputPath = path.join(__dirname,`../public/admin/images/product/${croppedFilename}`);
                    await sharp(croppedImageBuffer)
                        .toFile(outputPath);
                      
                    newImages.push(croppedFilename);
                }
            
            
            }
            const newProduct = new Product({
                name:req.body.name,
                description:req.body.description,
                categoryId:categoriesId._id,
                regularPrice:req.body.regularPrice,
                salePrice:req.body.salePrice,
                stock:req.body.stock
                // image:images

            })

            newProduct.image.push(...newImages)
            const productInsertedData = await newProduct.save()
            if(productInsertedData){
                res.render('add-product',{message: '2',categories:productData})
            }else{
            }
        }
    }catch(error){
        console.log(error.message)
        const productData = await Categories.find({isDeleted:false})
        let errorMessage = []
        errorMessage.push(error.message)
        console.log("error ::",errorMessage)
        res.render('add-product',{message: '3',errorMessage:errorMessage,categories:productData})
        
    }
}

// Loading Product pages

const loadProduct = async (req,res)=>{
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        var search = req.query.search || '';
        var category = req.query.category ||'';
      
        let productData = null
        if(req.query.category){
         productData = await Product.find({categoryId:req.query.category}).populate('categoryId').sort({createdOn:-1})
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
        res.render('products', {
            products: productData,
            categories:categoriesData,
            currentPage: page,
            totalPages: totalPages,
            search:search,
            category:category
        });

      
    } catch (error) {
        console.log(error.message)
        let errorData = []
            errorData.push(error.message)
        res.render('products', {
            products: "",
            currentPage: "",
            totalPages: "",
            errorData:errorData
        });
    }
}

const changeStatus = async (req,res)=>{
    try{
        const id =req.query.id;
        const active = req.query.active;
       
        if(active == 'true'){
            updateValue =false

        }else{
            updateValue = true
        }
        console.log(updateValue)

        const statusUpdation =  await Product.findByIdAndUpdate({_id:id},{$set:{isActive:updateValue}})

        if(statusUpdation){
             const message = "Product blocked Sucessfully"
        res.redirect(`/admin/products?message=${message}`)
        }

    }catch(error){
        console.log(error.message)
        res.render('../pages/errorAdmin',{error:error.message})
    }
}

const deleteProduct = async (req,res)=>{
    try{
        const id =req.query.id;
       

        const statusUpdation =  await Product.findByIdAndUpdate({_id:id},{$set:{isDeleted:true}})

        if(statusUpdation){
             const message = "Product deleted Sucessfully"
        res.redirect(`/admin/products?message=${message}`)
        }

    }catch(error){
        console.log(error.message)
        res.render('../pages/errorAdmin',{error:error.message})
    }
}

const loadEditProduct = async (req,res)=>{
    try{
        const productData = await Product.findById({_id:req.query.id})
        req.session.editProductId = req.query.id;
        const categoriesData = await Categories.find()
        const idCat = productData.categoryId
        const categoryName = await Categories.findById({_id:idCat})
         res.render('editProduct',{product:productData,categories:categoriesData,categoryname:categoryName})
    }catch(error){
        res.render('../pages/errorAdmin',{error:error.message})
        console.log(error.message)
    }
}



const editProduct = async (req,res)=>{
    try{
console.log("Deleted Image",req.body.deletedImages)
        const productId = req.session.editProductId ;
        

        const { name, description, regularPrice, salePrice, stock, categories } = req.body;
        const categoriesId = await Categories.findOne({ name: categories });
        const product = await Product.findOne({_id:productId});
        product.name = name;
        product.description = description;
        product.regularPrice = regularPrice;
        product.salePrice = salePrice;
        product.stock = stock;
        product.categoryId = categoriesId._id;
 
        const imageNames =Object.values(req.body.deletedImages) 
       

        // Get the names of images to be deleted
const deletedImages = req.body.deletedImages;

// Remove deleted images from the product
product.image = product.image.filter(image => !deletedImages.includes(image));

        if (req.files && req.files.length > 0) {
            const newImages = [];
        
            for (const file of req.files) {
                const filename = file.filename;
        
                // Use Sharp to crop the image (adjust the crop options as needed)
                const croppedImageBuffer = await sharp(file.path)
                    .resize({ width: 500, height: 500, fit: 'cover' }) // Example cropping options
                    .toBuffer();
        
                const croppedFilename = `cropped_${filename}`;
        
                const outputPath = path.join(__dirname,`../public/admin/images/product/${croppedFilename}`);
                // Save the cropped image
                await sharp(croppedImageBuffer)
                    .toFile(outputPath);
                    
                newImages.push(croppedFilename);
            }
        
            // Add the new cropped images to the product
            product.image.push(...newImages);
        
        }
      

          const updatedProduct = await product.save();
       
        const productDataAfterUpdation = await Product.find().populate('_id').populate("categoryId")


         res.redirect("/admin/products")


    }catch(error){
        console.log(error.message)
        res.render('../pages/errorAdmin',{error:error.message})
    }
}



module.exports = {
    loadAddProduct,
    insertProduct,
    loadProduct,
    changeStatus,
    deleteProduct ,
    loadEditProduct,
    editProduct
   
}