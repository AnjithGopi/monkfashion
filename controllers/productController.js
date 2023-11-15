const Product = require('../models/productModal')
const Categories = require('../models/categoriesModal')

const loadAddProduct = async (req,res)=>{
    try{
        const productData = await Categories.find()
        res.render('add-product',{categories:productData})
    }catch(error){
        console.log(error.message)
    }
}

const insertProduct  =  async (req,res)=>{
    try{
        const searchProduct = await Product.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') })

        // const searchReturnData = await Product.find()
        const productData = await Categories.find()
        const categoriesId = await Categories.findOne({name:req.body.categories})
       console.log("categoriews Id :",categoriesId._id)
        if(searchProduct){
            console.log("Worked the sweet")
            res.render('add-product',{message: '1',categories:productData})

            // res.redirect('/admin/categories')
        }else{
            const newProduct = new Product({
                name:req.body.name,
                description:req.body.description,
                categoryId:categoriesId._id,
                regularPrice:req.body.regularPrice,
                salePrice:req.body.salePrice,
                stock:req.body.stock,
                image:req.file.filename


            })
            // console.log('inages  ;',req.body.image)
            console.log("kkk")
            console.log(req.file.filename)
            const productInsertedData = await newProduct.save()
            if(productInsertedData){
                res.render('add-product',{message: '2',categories:productData})
            }else{
                console.log("not inserted")
            }
        }
    }catch(error){
        console.log(error.message)
    }
}


module.exports = {
    loadAddProduct,
    insertProduct
}