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
        // const searchCategories = await Categories.findOne({name:req.body.name})
        const searchCategories = await Categories.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') });
        const searchReturnData =await Categories.find()
        if(searchCategories){
            console.log("Worked the sweet")
            
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

            // res.render('categories',{message : true,categories:categoriesData});
            // res.redirect('/admin/categories')

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
        res.status(500).send("Internal Server Error");
    }
}

// const deleteCategories = async (req,res)=>{
//         try{
//             const id =  req.query.id
//             const userdata = await Categories.deleteOne({_id:id})
//             // req.flash('success', 'Message to display on the next page');
    
//             const message = "Category-deleted-Sucessfully"
//             console.log("Delete sucessfully ")
//             res.redirect('/admin/categories?message=${message}')
//             // res.redirect(`/admin/dashboard?message=${message}`)

//         }catch(error){
//             console.log(error.message)
//         }
    
// }

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
        res.status(500).send("Internal Server Error");
    }
    
}

// Load edit category
const loadEditCategories = async (req,res)=>{

    try{  
        const categoriesData = await Categories.findById({_id:req.query.id})
        res.render('editCategory',{categories:categoriesData})
    }catch(error){
        console.log(error.message)
    }
}

// update category
const editCategories = async (req,res)=>{
    try{  
        const categoriesName = req.body.name;
        console.log(categoriesName);
        const id = req.body.id
        console.log("id:",id)
        const categories = await Categories.findByIdAndUpdate({_id:id},{$set:{name:categoriesName}})

        if(categories){
            console.log('updated category sucessfully')
            console.log(categories)
            res.redirect('/admin/categories')
        }else{
            console.log("failed to update data category")
        }

    }catch(error){
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