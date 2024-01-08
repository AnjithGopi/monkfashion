const User = require('../models/userModal')
const OTP = require('../functions/generateOTP')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Product = require('../models/productModal');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModal');
const Wishlist = require('../models/wishlistModal');
const Wallet = require('../models/walletModel');
const Categories = require('../models/categoriesModal');
const Banner = require('../models/bannerModal');
const mongoose = require('mongoose');

const {generateRefferalId} = require('../functions/generateRefferalId')
const walletController = require('./walletController')
const securePassword = async(password)=>{

    try{
        const passwordHash = await bcrypt.hash(password,10);
        
        return passwordHash;
    }catch(error){
        console.log(error.message)
    }
}



const sendVerifyMail = async (req,res) => {
    try {
       
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            // If the email already exists, render an error message
            console.log("Email found")
           return res.status(500).json({success:false,
                warningMessage: "Email already exists. Choose a different email."
            });
            
        }

        req.session.name = req.body.name;
        req.session.email = req.body.email;
        req.session.mobile = req.body.mobile;
        req.session.password= req.body.password;
        req.session.referral= req.body.referral;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                // pass: 'nfjy xgfz fyxo rimf',
                pass:process.env.EMAIL_PASSWORD,

            },
        });

        const otp = OTP.generateOTP();
        req.session.otp = otp
        console.log("sendmail - generatd-otp:",otp)
        const mailOptions = {
            from: 'abhilash.brototype@gmail.com',
            to: req.body.email,
            subject: 'Verification Mail',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007bff;">Verification Code</h2>
                    <p>Dear User,</p>
                    <p>Your verification code is: <strong style="font-size: 1.2em; color: #28a745;">${otp}</strong></p>
                    <p>Please use this code to complete the verification process.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <p>Best regards,<br> Mong Fashion's Team</p>
                </div>
            `,
        };

        // Use Promise style for sending mail
        const info = await transporter.sendMail(mailOptions);
        // res.redirect('/verifyotp')
        res.status(200).json({success:true,redirect:'/verifyotp'})

    } catch (error) {
        res.render('../pages/error',{error:error.message})
        console.error('Error sending email:', error.message);
        
    }

};

const loadotpRedirect = async(req,res)=>{
    try{
        res.redirect('/verifyotp')

    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
}

const sendOtp = async(req,res,next)=>{
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass:process.env.EMAIL_PASSWORD,

            },
        });

        const otp = OTP.generateOTP();
        req.session.changePassword = req.body.password
        req.session.email = req.body.email
        req.session.otp = otp
        console.log("sendmail - generatd-otp:",otp)
        const mailOptions = {
            from: 'abhilash.brototype@gmail.com',
            to: req.body.email,
            subject: 'Verification Mail',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007bff;">Verification Code</h2>
                    <p>Dear User,</p>
                    <p>Your verification code is: <strong style="font-size: 1.2em; color: #28a745;">${otp}</strong></p>
                    <p>Please use this code to complete the verification process.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <p>Best regards,<br> Mong Fashion's Team</p>
                </div>
            `,
        };

        // Use Promise style for sending mail
        const info = await transporter.sendMail(mailOptions);
        if (info.accepted.length > 0) {
            console.log('Message sent: %s', info.messageId);
            next()
        }else{
            console.log("Otp failed to send")
        }
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
}


const loadOtp = async(req,res)=>{

    try{
    
        res.render('otp',{email:req.session.email});
    }catch(error){
        console.log(error.message)
    }
    // next()
}
const forgetPasswordOtp = async(req,res)=>{
    try{
        res.redirect('forgetPasswordOtp')
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
} 

const verifyOTP = async (req,res,next)=>{
    const userEnteredOtp = req.body.otp;

    console.log("verify-user-otp:",userEnteredOtp)
    console.log("verify-session-otp :",req.session.otp)
    try{
        if(userEnteredOtp === req.session.otp){
            // res.render('registrationSucess')
             next()
        }else{
            res.render('otp',{message:" otp is incorrect"})
            return

        }
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log("verify otp sending error :",error.message)
    }
    
};

const loadRegsucess = async (req,res) =>{
    try{
        res.render('registrationSucess')

    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
}


const newInsertUser = async(req,res,next)=>{
    const spass = await securePassword(req.session.password)
    try{

      const referralId = generateRefferalId()
      const user = new  User({
        name:req.session.name,
        email:req.session.email,
        mobile:req.session.mobile,
        password:spass,
        referralId:referralId
     
        });

        const userData = await user.save();        
        const validatereferralId = await User.findOne({referralId:req.session.referral})
        if(validatereferralId){
            const addToWallet = await walletController.addToWallet(100,validatereferralId._id)
            const addToWalletUser = await walletController.addToWallet(500,userData._id)
        }



        if(userData){
            const createWallet = await walletController.createUserWallet(userData._id)
            req.session.user_id = userData._id;  // Creating a session here because user need to directly redirect into home page after successfully creating an account.
            res.redirect('/home')
            
        }else{
            res.render('registrationSucess',{message : "Registration failed."});

        }

    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
   
}


const loadRegister = async(req,res)=>{

    try{
        res.render('registration1');
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message);
    }

}

const loadLogin = (req,res)=>{

    try{
        res.render('../pages/login')
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
}


// code for verifyin the User
const verifyLogin = async(req,res)=>{
    try{
       
        const email =req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email})

        if(userData){
                if(userData.isActive){
                    const passwordMatch = await  bcrypt.compare(password,userData.password);
                    if(passwordMatch){
                        let role = userData.isAdmin ? "admin" :"user"
                        if( userData.isAdmin){
                            console.log("Admin successfully loged")
                             req.session.admin = userData;
                        }else{
                            req.session.user_id = userData._id;
                            console.log("user successfully loged")

                        }
                        
                res.status(200).json({success:true,successMessage:" Login successfull",role:role})

                    }else{
                       
                res.status(404).json({success:false,warningMessage:" password is incorrect"})

                    }
        
                }else{
                   
                    res.status(404).json({success:false,warningMessage:" Not Found / Not Active"})
                }
        }else{
              
                res.status(404).json({success:false,warningMessage:" Email and password is incorrect"})

            }
    
        }catch(error){
            console.log(error.message)
        res.render('../pages/error',{error:error.message})
        }
    }

const loadForgetPassword  = async (req, res) => {
    try {
        res.render('forgetPassword')
    } catch (error) {
        res.render('../pages/error',{error:error.message})
        console.log(error.message);
    }
};

// Website Home Page
const loadHome = async(req,res)=>{

    try{
       const productData = await Product.find({isDeleted:false,isActive:true}).limit(12)
       const newProducts = await Product.find({isDeleted:false,isActive:true}).sort({createdOn:-1}).limit(10)
       const bannerData = await Banner.find()
       const categoriesData = await Categories.find({isDeleted:false,isActive:true})
       let cartCount = 0
       let userData = '';
       if(req.session.user_id){
        // console.log(req.session.user_id)
            const user = await User.findOne({_id:req.session.user_id})
            userData = user
              const cartData = await Cart.find({userId:req.session.user_id});
              if(cartData.length > 0)
               cartCount = cartData[0].product.length

       }
   let data = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" }
          }
        },
        { $sort: { totalQuantity: -1 } },
        {
            $limit: 10 
         },
        {
            $lookup:{
                from:'products',
                localField:'_id',
                foreignField:'_id',
                as:'productDetails'
            }
        }
      ]);
      
   
        res.render('index',{product:productData,cartQuantity: cartCount,userData:userData,newProducts:newProducts,banner:bannerData,categories:categoriesData,bestSeller:data });
       
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
}


const loadProduct = async(req,res)=>{

    try{
       const productData = await Product.findById({_id:req.query.id}).populate('review.userId')
       const ratingStars = await Product.aggregate([
            {
                $match:{ _id: new mongoose.Types.ObjectId(req.query.id) }
            },
            {
                $unwind:"$review"
            },
            {
                $group:{
                    _id:"$review.rating",
                    sum:{$sum:1}
                }
            }
       ])
       const ratingMap = {};
       for (let i = 1; i <= 5; i++) {
         ratingMap[i] = { _id: i, sum: 0 };
       }
       
       ratingStars.forEach(rating => {
         const { _id, sum } = rating;
         ratingMap[_id].sum = sum;
       });
       
       // Convert the map object back to an array
       const finalRatingData = Object.values(ratingMap);
       const userData = await User.findById(req.session.user_id)
       const similarProductData = await Product.find({categoryId:productData.categoryId}).populate('categoryId').limit(4)
       let cartCount = 0
       const cartData = await Cart.find({userId:req.session.user_id});
       if(cartData.length > 0)
        cartCount = cartData[0].product.length
        res.render('shopProduct',{product:productData,userData:userData,similarProduct : similarProductData,cartQuantity: cartCount,ratingData:finalRatingData});
       
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
}

// Function to logout the user

const logoutUser = async (req,res)=>{
    try{
        req.session.destroy(err => {
            if (err) {
              console.error('Error destroying session:', err);
              res.status(500).send('Internal Server Error');
            } else {
            
              res.redirect('/login');
            }
          })
    }catch(error){
        res.render('../pages/error',{error:error.message})
        console.log(error.message)
    }
}

// Function to load user profile
const loadProfile = async(req,res)=>{
    try{
        // console.log("Load profile recieved")
        const userId = req.session.user_id
        const userData = await User.findById(req.session.user_id)
        const orderData = await Order.find({userId:userId}).sort({orderDate:-1})
      
        const walletData = await Wallet.findOne({userId:userId})
        res.render('userProfile',{user:userData,order:orderData,wallet:walletData})

    }catch(error){
        res.render('../pages/error',{error:error.message})
         console.log(error.message)
    }
}

// To add address
const addAddress = async (req,res)=>{
    console.log("Add address post received")
    try{
        const userId = req.session.user_id
        const { fullName, phone, phone2, houseName, state, city, pincode, landMark } = req.body;
        const user = await User.findById(userId)
        if(!user){
            console.log("User Not found")
            return
        }
        const newAddress = {
            fullName:req.body.fname,
            phone:req.body.phoneNumber,
            phone2:req.body.phone2,
            houseName:req.body.cname,
            state:req.body.state,
            city:req.body.city,
            pincode:req.body.pincode,
            landMark:req.body.landMark
        };

        // Add the new address to the user's address array
        user.address.push(newAddress);

        const updatedUser = await user.save();
        // console.log(updatedUser)
        res.status(201).render('userProfile',{user:updatedUser,messageAddress:"New Address Added Sucessfully"})
    }catch(error){
        // console.log(error.message)
        res.render('../pages/error',{error:error.message})
    }
}

// Function to remove address from user Profile

const removeAddress = async (req,res)=>{
    try{
        
        const userId = req.session.user_id
        const index = req.params.index
        const userData = await User.findById(userId)
        // console.log("User Data :",userData)

        const result = await User.updateOne(
            { _id: userId },
            { $unset: {[`address.${index}`]: 1 }}
        );
        await User.updateOne(
            { _id: userId },
            { $pull: { address: null } }
        );
       
        res.status(200).json({ success: true, message: 'Product removed successfully.' });
    }catch(error){
        res.render('../pages/error',{error:error.message})
        
    }
}

// Load edit Address Page
const loadEditAddress = async( req,res)=>{
    try{
        const userId = req.session.user_id
        const addressId = req.query.id
        const index = req.query.index
        const userData = await User.findById(userId)
        res.render('editAddress',{address:userData.address[`${index}`]})
    }catch(error){
        res.render('../pages/error',{error:error.message})
    }
}

const editAddress = async ( req,res)=>{
    try{
        const userId = req.session.user_id
        const addressIdToUpdate = req.body.id

        const updatedValues = {
            fullName: req.body.fname,
            phone:  req.body.phoneNumber,
            phone2:  req.body.phone2,
            houseName: req.body.houseName,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            landMark: req.body.landMark
           
        };
       const result = await User.updateOne(
            { _id: userId, 'address._id': addressIdToUpdate },
            { $set: { 'address.$': updatedValues } },
            
        );
        const userData = await User.findById(userId)
        const orderData = await Order.find({userId:userId})

        if(result)
        res.render('userProfile',{user:userData,messageAddress:"Address edited sucessfully",order:orderData})
        res.render('userProfile',{user:userData,messageAddress:"Failed to edit address ",order:orderData})


        
    }catch(error){
        const errorData =[]
        const userData = await User.findById(req.session.user_id)

        errorData.push(error.message)
        console.log("Error Data :",errorData)
        res.render('userProfile',{user:userData,errorMessage:"Failed Some error occurs ",error:errorData})

    }
}

// function to Load update User Profile
const loadUpdateUserProfile = async(req,res)=>{
    try{
        const userData = await User.findById(req.session.user_id)
        res.render('updateUserProfile',{user:userData})
    }catch(error){
        res.render('../pages/error',{error:error.message})
        
    }
}
// function to update User Profile
const updateUserProfile = async (req,res) =>{
    try{
        
        const {name,phone,email,dob} = req.body
        const userId = req.session.user_id
        const result = await User.findOneAndUpdate({_id:userId},{name:name,email:email,mobile:phone,dob:dob})
        const userData = await User.findById(req.session.user_id)
        const orderData = await Order.find({userId:userId})

        if(result)
        res.render('userProfile',{user:userData,successMessage:"Profile updated sucessfully",order:orderData})
        else
        res.render('userProfile',{user:userData,failedMessage:"Failed to update Profile ",order:orderData})

    }catch(error){
        
        const errorData =[]
        const userData = await User.findById(req.session.user_id)

        errorData.push(error.message)
        res.render('userProfile',{user:userData,errorMessage:"Failed Some error occurs ",error:errorData})

        console.log(error.message)
    }
}

const loadChangePassword = async (req,res) =>{
    try{
        res.render('changePassword')
    }catch(error){
        res.render('../pages/error',{error:error.message})
    
    }
}

const verifyChangePasword = async (req,res,next) =>{
    try{
        const userId = req.session.user_id
        const userData = await User.findById(userId)
        const userPassword =  userData.password
        const {password,cpassword} = req.body
        if(userData){
            if(userData.isActive){
                const passwordMatch = await  bcrypt.compare(password,userData.password);
                console.log("passwordMatch :",passwordMatch)
                if(passwordMatch){
                   
                    req.session.cpassword = cpassword
                    const spass = await securePassword(cpassword)
                    const result = await User.findOneAndUpdate({_id:userId},{password:spass})
                   
                    const orderData = await Order.find({userId:userId})
                    if(result){
                        res.render('userProfile',{user:userData,successMessage:"Password Changed Sucessfully",order:orderData});
                        
                    }
                    else
                        res.render('userProfile',{user:userData,failedMessage:"Failed to change the password",order:orderData});
                       
                    // next()
                    return
                    }else{
                      const orderData = await Order.find({userId:userId})
                    res.render('userProfile',{user:userData,failedMessage:"Password Mismatch ",order:orderData});
                }
    
            }else{
                res.render('userProfile',{user:userData,failedMessage:"Failed to change the password 2"});
            }
    }else{
        res.render('userProfile',{user:userData,failedMessage:"Failed to change the password 3"});

        }

    }catch(error){
        res.render('../pages/error',{error:error.message})
    }
}

const changePasswordSendOtp = async(req,res)=>{
    try{
        const userData = await User.findById(req.session.user_id)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass:process.env.EMAIL_PASSWORD,
            },
        });

        const otp = OTP.generateOTP();
        req.session.changePassword = otp
        req.session.otp = otp;
        console.log(req.session.otp)
        console.log("sendmail - generatd-otp:",otp)
        const mailOptions = {
            from: process.env.EMAIL,
            to: userData.email,
            subject: 'Verification Mail',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007bff;">Verification Code</h2>
                    <p>Dear User,</p>
                    <p>Your verification code is: <strong style="font-size: 1.2em; color: #28a745;">${otp}</strong></p>
                    <p>Please use this code to complete the verification process.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <p>Best regards,<br> Mong Fashion's Team</p>
                </div>
            `,
        };
        
        // Use Promise style for sending mail
        const info = await transporter.sendMail(mailOptions);
        if(info)
            res.redirect("/home/profile/updateProfile/otp")
        // console.log('Message sent: %s', info.messageId);
    }catch(error){
        res.render('../pages/error',{error:error.message})
    }
}

const loadChangePasswordOtp = async (req,res) =>{
    try{
        res.render('otp2')
    }catch(error){
        res.render('../pages/error',{error:error.message})
    } 
}

const clearOtp = async (req,res) =>{
    try{
       
         delete req.session.changePassword
         req.session.save()
        res.json({
            success: true,
            
        });

    }catch(error){
        res.render('../pages/error',{error:error.message})
    }
}

const  changePasswordVerifyOtp = async (req,res)=>{
    try{

        const otpUser = req.body.otp.join("")
        console.log("User otp :",req.session.changePassword) 
        console.log("User otp :",req.session.otp) 
        if( otpUser === req.session.otp ){
                    const cpassword =  req.session.changePassword
                    const email =  req.session.email
                    const spass = await securePassword(cpassword)
                    const result = await User.findOneAndUpdate({email:email},{password:spass})
                    if(result){
                        res.render('../pages/login',{successMessage:"Successfully changed Password"})
   
                    }
                    else
                    res.render('../pages/login',{warnningMessage:"Failed to change Password"})
                    req.session.destroy()
        }else{
            res.render('otp2',{errorMessage:"Wrong password"})
        }
        
    }catch(error){
        res.render('../pages/error',{error:error.message})
    }
}

const cancelOrder = async (req,res)=>{
    try{
        console.log("Cancel Order request recieved")
        const {orderId,index} = req.body
        const userId = req.session.user_id
        const cancelOrder = await Order.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Cancelled"}},{new:true})
        if(cancelOrder){
        res.status(200).json({ success: true, successMessage: 'Product Cancelled sucesfully' });

        }

    }catch(error){
        console.log(error.message)
        res.render('../pages/error',{error:error.message})

    }
}

const loadOrderDetails = async (req,res)=>{

    try {
        console.log("View Order details received")
        const orderId = req.query.id;
        const orderData = await Order.findById(orderId)
        .populate('userId') 
        .populate('items.productId') 
        .exec();
    
        res.render('orderDetails' ,{order:orderData})
    } catch (error) {
        res.render('../pages/error',{error:error.message})
    }
}
const loadAllProducts = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        var search = ""
        if( req.query.search){
            search= req.query.search
        }
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        const categoryData = await Categories.find({isActive:true})
        const cartData = await Cart.findOne({userId:req.session.user_id});

        
        console.log("Load all products worked")
           
                const productQuery = {
                    isDeleted: false,
                    isActive: true,
                    $or: [
                        { name: { $regex: search, $options: 'i' } } 
                    ]
                };

                if (req.query.categoryId) {
                    productQuery.categoryId = new mongoose.Types.ObjectId(req.query.categoryId);
                }

                const productData = await Product.find(productQuery)
                    .populate('categoryId')
                    .skip(skip)
                    .limit(limit);

                const productDataToPass = productData;
             let cartQuantity = 0;
             if(cartData){
                if(cartData.product)
                 cartQuantity = cartData.product.length
             }
          
        res.render("allProducts",{products:productDataToPass,cartQuantity:cartQuantity, currentPage: page,  totalPages: totalPages,categories:categoryData,search:req.query.search,categoryId:req.query.categoryId})

    }catch(error){
        res.render('../pages/error',{error:error.message})
    }
}

const getQuantity = async (req, res) => {
    try {
       const cartData = await Cart.findOne({userId:req.session.user_id})
       const wishlistData = await Wishlist.findOne({userId:req.session.user_id}) 
       let cartQuantity = 0
       let wishlistQuantity = 0
        if(cartData && cartData.product.length >0){
             cartQuantity = cartData.product.length ;
        }
        if(wishlistData && wishlistData.product.length >0){
            wishlistQuantity = wishlistData.product.length ;
       }
            res.status(200).json({success:true,cartQuantity:cartQuantity,wishlistQuantity:wishlistQuantity})
        
    } catch (error) {
        res.render('../pages/error',{error:error.message})
    }
};


module.exports ={
    loadRegister,
    loadLogin,
    loadHome,
    verifyLogin,
    sendVerifyMail,
    loadOtp,
    verifyOTP,
    forgetPasswordOtp,
    newInsertUser,
    loadotpRedirect ,
    loadRegsucess,
    loadForgetPassword,
    sendOtp,
    loadProduct,
    logoutUser,
    loadProfile,
    addAddress,
    removeAddress,
    loadEditAddress,
    editAddress,
    updateUserProfile,
    loadUpdateUserProfile,
    loadChangePassword,
    loadChangePasswordOtp,
    verifyChangePasword,
    changePasswordVerifyOtp,
    changePasswordSendOtp,
    clearOtp,
    cancelOrder,
    loadOrderDetails,
    loadAllProducts,
    getQuantity
    
}
