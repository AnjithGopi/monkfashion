const User = require("../models/userModal")

const bcrypt = require('bcrypt')


    const loadLogin = async(req,res)=>{
        try{
            res.render('login')
        }catch(error){
            console.log(error.message)
        }
    }
    

    const verifyLogin = async(req,res)=>{

        try{
            
            const email =req.body.email;
            const password = req.body.password;
    
          const adminData = await User.findOne({email:email})
          console.log(adminData)
    
           if(adminData){
           const passMatch = await bcrypt.compare(password,adminData.password)
            if(passMatch){
    
                if(adminData.isAdmin === 0){
                    res.render('login',{message:" password is incorrect"})
    
                }else{
                    req.session.admin_id = adminData._id;
                    // res.redirect("/h")
                    // res.end("Sucessfull")
                    res.render('index')
                }
    
            }else{
            res.render('login',{message:" password is incorrect"})
        }
           }else{
            res.render('login',{message:" password is incorrect"})
        }
    
        }catch(error){
            console.log(error.message)
        }
    }

const loadUserList = async(req,res)=>{
    try{
        const userData = await User.find({isAdmin:0})
        // console.log("USer dataaa",userData)
        res.render('user-list',{users:userData})
    }catch(error){
        console.log(error.message)
    }
}

const changeStatus = async (req,res)=>{
    try{
        const id =req.query.id;
        const active = req.query.admin;
       
        if(active == 0){
            updateValue = 1

        }else{
            updateValue = 0
        }

        const statusUpdation =  await User.findByIdAndUpdate({_id:id},{$set:{isActive:updateValue}})


        if(statusUpdation){
            // res.redirect('/userList')
             const message = "User blocked Sucessfully"
             req.session.destroy(err => {
                if (err) {
                  console.error('Error destroying session:', err);
                  res.status(500).send('Internal Server Error');
                } else {
                
                
                  res.redirect(`/admin/userList?message=${message}`)
                }
              })
        }

    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}

module.exports ={
   loadLogin,
   verifyLogin,
   loadUserList,
   changeStatus
  
}
    
