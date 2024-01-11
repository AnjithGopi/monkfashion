const Categories = require('../models/categoriesModal')
const sharp = require('sharp')
const path = require('path')

const loadCategories = async(req,res)=>{
    try{
        const categoriesData = await Categories.find({isDeleted:false})
        // console.log(categoriesData)
        res.render('categories',{categories:categoriesData})
    }catch(error){
        res.render('../pages/errorAdmin',{error:error.message})
        console.log(error.message)
    }
}


const addCategories =  async(req,res)=>{
    try{
        // const searchCategories = await Categories.findOne({name:req.body.name})
        const searchCategories = await Categories.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') });
        const searchReturnData =await Categories.find()
        if(searchCategories){
            
            res.render('categories',{message :'1',categories:searchReturnData});
            // res.redirect('/admin/categories')
        }else{
            const newCategories = new Categories({
                name:req.body.name
            }) 
            const categoriesData = await newCategories.save();

            if(categoriesData){

            const dataAfter = await Categories.find()
            console.log("categories data :",categoriesData)
            res.render('categories',{message :'2',categories:dataAfter});

          

            }else{
            // res.render('registrationSucess',{message : "Registration failed."});
            console.log("failed")

            }
        }
  


    }catch(error){
        res.render('../pages/errorAdmin',{error:error.message})
        console.log(error.message)
    }
}


const changeCategoriesStatus = async (req,res)=>{
    try{
        const id =req.query.id;
        const active = req.query.active;
        console.log(active,id)
       
        if(active === 'true'){
            updateValue = false

        }else{
            updateValue = true
        }


        const statusUpdation =  await Categories.findByIdAndUpdate({_id:id},{$set:{isActive:updateValue}})

        console.log(updateValue)

        console.log(statusUpdation)

        if(statusUpdation){
            // res.redirect('/userList')
             const message = "Category bloced Sucessfully"
        res.redirect(`/admin/categories?message=${message}`)
        }

    }catch(error){
        console.log(error.message)
        res.render('../pages/errorAdmin',{error:error.message})
    }
}



const deleteCategories = async (req,res)=>{
    try{
        const id =req.query.id;
        const statusUpdation =  await Categories.findByIdAndUpdate({_id:id},{$set:{isDeleted:true}})
        if(statusUpdation){
             const message = "Product deleted Sucessfully"
        res.redirect(`/admin/categories?message=${message}`)
        }

    }catch(error){
        console.log(error.message)
        res.render('../pages/errorAdmin',{error:error.message})
    }
    
}

// Load edit category
const loadEditCategories = async (req,res)=>{

    try{  
        const categoriesData = await Categories.findById({_id:req.query.id})
        res.render('editCategory',{categories:categoriesData})
    }catch(error){
        res.render('../pages/errorAdmin',{error:error.message})
        console.log(error.message)
    }
}

// update category
const editCategories = async (req,res)=>{
    try{  
        const categoriesName = req.body.name;
        const categoriesId = req.body.id;
        const id = req.body.id
        const searchCategories = await Categories.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') });
        
        const categories = await Categories.findOne({name: new RegExp('^' + categoriesName + '$', 'i')});
        if(categories && categories._id.toString()!==categoriesId){
            req.flash('error', 'Category Name already Exist');
            res.redirect(`/admin/categories/editCategories?id=${categoriesId}`);
        }else{

            const categories = await Categories.findOne({_id:categoriesId});
   
        categories.name = categoriesName;
 

        if (req.files && req.files.length > 0) {
            const newImages = [];
        
            for (const file of req.files) {
                const filename = file.filename;
        
                // Use Sharp to crop the image (adjust the crop options as needed)
                const croppedImageBuffer = await sharp(file.path)
                    .resize({ width: 500, height: 600, fit: 'cover' }) // Example cropping options
                    .toBuffer();
        
                const croppedFilename = `cropped_${filename}`;
        
                const outputPath = path.join(__dirname,`../public/admin/images/category/${croppedFilename}`);
                // Save the cropped image
                await sharp(croppedImageBuffer)
                    .toFile(outputPath);
                    
                newImages.push(croppedFilename);
            }  
            categories.image = newImages;
        }
      
          const updatedCategories = await categories.save();

        if(updatedCategories){
            res.redirect('/admin/categories')
        }else{
            console.log("failed to update data category")
        }
        }

    }catch(error){
        res.render('../pages/errorAdmin',{error:error.message})
        console.log(error.message)
    }
}

module.exports = {
    loadCategories,
    addCategories,
    changeCategoriesStatus,
    deleteCategories,
    editCategories,
    loadEditCategories
}