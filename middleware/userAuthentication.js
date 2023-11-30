const isLogin = async(req,res,next)=>{

    try{

    if(req.session.user_id){
        // res.redirect('/home')  
    }else{
        res.redirect('/login')
        return
    }
    next();
    }catch(error){
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{

    try{
        if(req.session.user_id){
            res.redirect('/home')
            // return;
        }
        else{
            
            next();
        }
    }catch(error){
        console.log(error.message);
    }
}

// const isLogout = (req,res,next)=>{
//     if(req.session.user_id){
//         // res.redirect('/home')
//         res.render("home")
//     }
// }

module.exports = {
    isLogin,
    isLogout
}