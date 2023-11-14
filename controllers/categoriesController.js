const Categories = require('../models/categoriesModal')



const loadCategories = async(req,res)=>{
    try{
        const categoriesData = await Categories.find({})
        // console.log(categoriesData)
        res.render('categories',{categories:categoriesData})
    }catch(error){
        console.log(error.message)
    }
}

const addCategories =  async(req,res)=>{
    try{
        const searchCategories = await Categories.findOne({name:req.body.name})
        const searchReturnData =await Categories.find()
        if(searchCategories){
            console.log("Worked the sweet")
            res.render('categories',{message : true,categories:searchReturnData});
            // res.redirect('/admin/categories')
        }else{
            const newCategories = new Categories({
                name:req.body.name
            }) 
            const categoriesData = await newCategories.save();

            if(categoriesData){

            console.log("categories data :",categoriesData)
            // res.render('categories',{message : true,categories:categoriesData});
            res.redirect('/admin/categories')

            }else{
            // res.render('registrationSucess',{message : "Registration failed."});
            console.log("failed")

            }
        }
  


    }catch(error){
        console.log(error.message)
    }
}


const changeCategoriesStatus = async (req,res)=>{
    try{
        const id =req.query.id;
        const active = req.query.active;
       
        if(active == 0){
            updateValue = 1

        }else{
            updateValue = 0
        }

        const statusUpdation =  await Categories.findByIdAndUpdate({_id:id},{$set:{is_active:updateValue}})


        if(statusUpdation){
            // res.redirect('/userList')
             const message = "Category bloced Sucessfully"
        res.redirect(`/admin/categories?message=${message}`)
        }

    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}

const deleteCategories = async (req,res)=>{
        try{
            const id =  req.query.id
            const userdata = await Categories.deleteOne({_id:id})
            // req.flash('success', 'Message to display on the next page');
    
            const message = "Category-deleted-Sucessfully"
            console.log("Delete sucessfully ")
            res.redirect('/admin/categories?message=${message}')
            // res.redirect(`/admin/dashboard?message=${message}`)

        }catch(error){
            console.log(error.message)
        }
    
}

module.exports = {
    loadCategories,
    addCategories,
    changeCategoriesStatus,
    deleteCategories
}