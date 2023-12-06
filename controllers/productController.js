const Product = require('../models/productModal')
const Categories = require('../models/categoriesModal')
const { DefaultDeserializer } = require('v8')

const loadAddProduct = async (req,res)=>{
    try{
        const categoriesData = await Categories.find({isDeleted:false})
        res.render('add-product',{categories:categoriesData})
    }catch(error){
        console.log(error.message)
    }
}

const insertProduct  =  async (req,res)=>{
    try{
        const searchProduct = await Product.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') })

        // const searchReturnData = await Product.find()
        const productData = await Categories.find({isDeleted:false})
        const categoriesId = await Categories.findOne({name:req.body.categories})
       console.log("categoriews Id :",categoriesId._id)
        if(searchProduct){
            console.log("Worked the sweet")
            res.render('add-product',{message: '1',categories:productData})

            // res.redirect('/admin/categories')
        }else{
            const images = req.files.map(file => file.filename);
            console.log("Images :",images)
            console.log("Images :",req.body)
            const newProduct = new Product({
                name:req.body.name,
                description:req.body.description,
                categoryId:categoriesId._id,
                regularPrice:req.body.regularPrice,
                salePrice:req.body.salePrice,
                stock:req.body.stock,
                image:images

            })
            // console.log('inages  ;',req.body.image)
            console.log("kkk")
            console.log(images)
            const productInsertedData = await newProduct.save()
            if(productInsertedData){
                res.render('add-product',{message: '2',categories:productData})
            }else{
                console.log("not inserted")
            }
        }
    }catch(error){
        console.log("Catch worked")
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
//   const productData = await Product.find() 
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        var search = '';
        var category = '';
        if(req.query.search){
            search = req.query.search;
        }
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
        res.render('products', {
            products: productData,
            categories:categoriesData,
            currentPage: page,
            totalPages: totalPages,
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
        console.log(id)
        const active = req.query.active;
        console.log(active)
        console.log(typeof(active))
       
        if(active == 'true'){
            updateValue =false

        }else{
            updateValue = true
        }
        console.log(updateValue)

        const statusUpdation =  await Product.findByIdAndUpdate({_id:id},{$set:{isActive:updateValue}})

              console.log(statusUpdation)
        if(statusUpdation){
            // res.redirect('/userList')
             const message = "Product blocked Sucessfully"
        res.redirect(`/admin/products?message=${message}`)
        }

    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}

const deleteProduct = async (req,res)=>{
    try{
        const id =req.query.id;
       

        const statusUpdation =  await Product.findByIdAndUpdate({_id:id},{$set:{isDeleted:true}})

              console.log(statusUpdation)
        if(statusUpdation){
            // res.redirect('/userList')
             const message = "Product deleted Sucessfully"
        res.redirect(`/admin/products?message=${message}`)
        }

    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
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
        console.log(error.message)
    }
}



const editProduct = async (req,res)=>{
    try{
console.log("Dleted Image",req.body.deletedImages)
        const productId = req.session.editProductId ;
        
        console.log(productId)
        // const productId = req.params.productId;


        // Access form data from req.body
        const { name, description, regularPrice, salePrice, stock, categories } = req.body;
        console.log(req.body)
        // Getting the category Id from Category 
        const categoriesId = await Categories.findOne({ name: categories });
        console.log("Category Name",categories)
        console.log(categoriesId)
        // Find the product by ID
        const product = await Product.findOne({_id:productId});

        // Update the product properties
        product.name = name;
        product.description = description;
        product.regularPrice = regularPrice;
        product.salePrice = salePrice;
        product.stock = stock;
        product.categoryId = categoriesId._id;
 
        console.log("req . file data", req.files)
        const imageNames =Object.values(req.body.deletedImages) 
        console.log("images name",imageNames)
        console.log(typeof(imageNames))
        console.log(imageNames)

        // Get the names of images to be deleted
const deletedImages = req.body.deletedImages;

// Remove deleted images from the product
product.image = product.image.filter(image => !deletedImages.includes(image));

      
// const imageData = await Product.find({_id:productId})

        if (req.files && req.files.length > 0) {
            // const images = req.files.map(file => file.filename);
            const newImages = req.files.map(file => file.filename);
             product.image.push(...newImages);

            // console.log("Map Worked")
            // const updatingData = await Product.updateOne(
            //     { _id: productId },
            //     { $push: { image: { $each: images } } }
            //   );
            // product.image.push(...images,...imageData.image);
            console.log("Image from file   :",newImages)
        }
      

          const updatedProduct = await product.save();
        // Save the updated product to the database
       
        const productDataAfterUpdation = await Product.find().populate('_id').populate("categoryId")


        console.log("Product updated successfully:", updatedProduct);
        // console.log("product ::",productDataAfterUpdation)
        // res.send('Product updated successfully');
        // res.render('products',{products:productDataAfterUpdation,message:3})
        res.redirect("/admin/products")


    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal server error")
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