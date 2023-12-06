const User = require('../models/userModal')
const OTP = require('../functions/generateOTP')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { nextTick } = require('process');

const Product = require('../models/productModal');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModal');
const { error } = require('console');

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
            return res.render('registration', { emailexistmessage: "Email already exists. Choose a different email." });
        }

        req.session.name = req.body.name;
        req.session.email = req.body.email;
        req.session.mobile = req.body.mobile;
        req.session.password= req.body.password;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhilash.brototype@gmail.com',
                // pass: 'nfjy xgfz fyxo rimf',
                pass:'simf cqwp wvxj bent',

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

        console.log('Message sent: %s', info.messageId);
        res.redirect('/verifyotp')

    } catch (error) {
        console.error('Error sending email:', error.message);
        
    }

};

const loadotpRedirect = async(req,res)=>{
    try{
        res.redirect('/verifyotp')

    }catch(error){
        console.log(error.message)
    }
}



const loadOtp = async(req,res)=>{

    try{
    //    const userData = await User.findById({_id:req.session.user_id})
    // res.setHeader('Custom-Header', '/htmlotp'); 
    // res.setHeader('')
        res.render('otp',{email:req.session.email});
    }catch(error){
        console.log(error.message)
    }
    // next()
}

const verifyOTP = async (req,res,next)=>{
    const userEnteredOtp = req.body.otp;

    console.log("verify-user-otp:",userEnteredOtp)
    console.log("verify-session-otp :",req.session.otp)
    try{
        if(userEnteredOtp === req.session.otp){
            console.log('verification sucessfull')
            // res.render('registrationSucess')
             next()
        }else{
            console.log('verification failed')
            res.render('otp',{message:" otp is incorrect"})
            return

        }
    }catch(error){
        console.log("verify otp sending error :",error.message)
    }
    
};

const loadRegsucess = async (req,res) =>{
    try{
        res.render('registrationSucess')

    }catch(error){
        console.log(error.message)
    }
}


const newInsertUser = async(req,res,next)=>{
    const spass = await securePassword(req.session.password)
    try{
        // const existingUser = await User.findOne({ email: req.bod.email });

        // if (existingUser) {
        //     // If the email already exists, render an error message
        //     return res.render('registration', { emailexistmessage: "Email already exists. Choose a different email." });
        // }

      const user = new  User({
        name:req.session.name,
        email:req.session.email,
        mobile:req.session.mobile,
        password:spass
     
        });

        const userData = await user.save();

        if(userData){
            req.session.user_id = userData._id;  // Creating a session here because user need to directly redirect into home page after successfully creating an account.
            res.redirect('/home')
            console.log(userData)
            
            // sendVerifyMail(req.body.name,req.body.email,userData._id)
            // res.render('registrationSucess',{message : "Sucessfully Registered"});
        }else{
            res.render('registrationSucess',{message : "Registration failed."});

        }

    }catch(error){
        console.log(error.message)
    }
    next()
}


const loadRegister = async(req,res)=>{

    try{
        res.render('registration');
    }catch(error){
        console.log(error.message);
    }

}

const loadLogin = (req,res)=>{

    try{
        res.render('login')
    }catch(error){
        console.log(error.message)
    }
}


// code for verifyin the User
const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email})
        console.log(userData)

        if(userData){
                if(userData.isActive){
                    const passwordMatch = await  bcrypt.compare(password,userData.password);
                    if(passwordMatch){
                        req.session.user_id = userData._id;
                        res.redirect('/home');
                    }else{
                        console.log(userData.password)
                        console.log(password)
                        res.render('login',{message:" password is incorrect"})
                    }
        
                }else{
                    res.render('login',{message:" User is not active"})
        
                }
        }else{
                res.render('login',{message:"Email and password is incorrect"})
            }
    
        }catch(error){
            console.log(error.message)
        }
    }
// Website Home Page
const loadHome = async(req,res)=>{

    try{
       const productData = await Product.find()
    //    console.log("product data ::",productData)
       console.log("product data ::",productData.length)
       let cartCount = 0
       console.log("........................................")
       if(req.session.user_id){
        console.log(req.session.user_id)
              const cartData = await Cart.find({userId:req.session.user_id});
            //   console.log("cart data",cartData)
              console.log("........................................")
              if(cartData.length > 0)
               cartCount = cartData[0].product.length

       }
       console.log("cart count",cartCount)
    //    console.log("cart count",cartCount[0].product.length)
        res.render('index',{product:productData,cartQuantity: cartCount });
        //her cartquantity is removed and need to change it to previous
       
    }catch(error){
        console.log(error.message)
    }
}


const loadProduct = async(req,res)=>{

    try{
       const productData = await Product.findById({_id:req.query.id})
     
        res.render('shopProduct',{product:productData});
       
    }catch(error){
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
        console.log(error.message)
    }
}

// Function to load user profile
const loadProfile = async(req,res)=>{
    try{
        console.log("Load profile recieved")
        const userId = req.session.user_id
        const userData = await User.findById(req.session.user_id)
        const orderData = await Order.find({userId:userId})
        // console.log("ORder data :",orderData)
        // console.log(userData)
        // console.log(userData.address[0].fullName)
        res.render('userProfile',{user:userData,order:orderData})

    }catch(error){
        console.log("Load profile catch recieved")

        const errorData =[]
        const userId = req.session.user_id
        const userData = await User.findById(req.session.user_id)

        errorData.push(error.message)
        console.log("Error Data :",errorData)
        const orderData = await Order.find({userId:userId})
        res.render('userProfile',{user:userData,errorMessage:"Failed Some error occurs ",order:orderData,error:errorData})

        console.log(error.message)
    }
}

// To add address
const addAddress = async (req,res)=>{
    console.log("Add address post received")
    // console.log(req.body)
    try{
        const userId = req.session.user_id
        console.log("user Id :",userId)
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

        // Save the user with the updated address array
        const updatedUser = await user.save();
  

        // console.log(updatedUser)
        res.status(201).render('userProfile',{user:updatedUser,messageAddress:"New Address Added Sucessfully"})
        

    }catch(error){
        console.log(error.message)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Function to remove address from user Profile

const removeAddress = async (req,res)=>{
    try{
        console.log("Delete address recieved")
        console.log("Index :",req.params.index)
        const userId = req.session.user_id
        const index = req.params.index
        const userData = await User.findById(userId)
        // console.log("User Data :",userData)

        const result = await User.updateOne(
            { _id: userId },
            { $unset: {[`address.${index}`]: 1 }}
        );
        console.log(result)
        // Remove null values from the address array
        await User.updateOne(
            { _id: userId },
            { $pull: { address: null } }
        );
        // if (result.nModified > 0) {
        //     // Display Toastr confirmation
        //     toastr.success('Product removed successfully.', 'Confirmation');
            
        // } 
        res.status(200).json({ success: true, message: 'Product removed successfully.' });
    }catch(error){
        console.log(error.message)
    }
}

// Load edit Address Page
const loadEditAddress = async( req,res)=>{
    try{
        const userId = req.session.user_id
        const addressId = req.query.id
        const index = req.query.index
        console.log("id :",addressId)
        const userData = await User.findById(userId)
        // const result = await User.updateOne(
        //     { _id: userId, [`address._id`]: addressId },
        //     {$set:{
        //         city:"New York"
        //     }}
        // );
        
        // console.log(result)
        res.render('editAddress',{address:userData.address[`${index}`]})
    }catch(error){
        console.log(error.message)
    }
}

const editAddress = async ( req,res)=>{
    try{
        console.log("Edit address Post recieved")
        // console.log(req.body)
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

        console.log(error.message)
    }
}

// function to Load update User Profile
const loadUpdateUserProfile = async(req,res)=>{
    try{
        const userData = await User.findById(req.session.user_id)
        res.render('updateUserProfile',{user:userData})
    }catch(error){
        const errorData =[]
        const userData = await User.findById(req.session.user_id)

        errorData.push(error.message)
        console.log("Error Data :",errorData)
        res.render('userProfile',{user:userData,errorMessage:"Failed Some error occurs ",error:errorData})

        console.log(error.message)
    }
}
// function to update User Profile
const updateUserProfile = async (req,res) =>{
    try{
        console.log("User profile updation Post recieved")
        console.log(req.body)
        const {name,phone,email,dob} = req.body
        const userId = req.session.user_id
        console.log(name)
        const result = await User.findOneAndUpdate({_id:userId},{name:name,email:email,mobile:phone,dob:dob})
        const userData = await User.findById(req.session.user_id)
        console.log("result after updation :",userData)
        const orderData = await Order.find({userId:userId})

        if(result)
        res.render('userProfile',{user:userData,successMessage:"Profile updated sucessfully",order:orderData})
        else
        res.render('userProfile',{user:userData,failedMessage:"Failed to update Profile ",order:orderData})

    }catch(error){
        
        const errorData =[]
        const userData = await User.findById(req.session.user_id)

        errorData.push(error.message)
        console.log("Error Data :",errorData)
        res.render('userProfile',{user:userData,errorMessage:"Failed Some error occurs ",error:errorData})

        console.log(error.message)
    }
}

const loadChangePassword = async (req,res) =>{
    try{
        res.render('changePassword')
    }catch(error){
        console.log(error.message)
    }
}

const verifyChangePasword = async (req,res,next) =>{
    try{
        console.log(req.body)
        const userId = req.session.user_id
        const userData = await User.findById(userId)
        const userPassword =  userData.password
        const {password,cpassword} = req.body
        if(userData){
            if(userData.isActive){
                const passwordMatch = await  bcrypt.compare(password,userData.password);
                console.log("passwordMatch :",passwordMatch)
                if(passwordMatch){
                    // const spass = await securePassword(cpassword)
                    // console.log("spass :",spass)
                    // const result = await User.findOneAndUpdate({_id:userId},{password:spass})
                    // console.log("result :",result)
                    console.log("Password matched ")
                    req.session.cpassword = cpassword
                    next()
                    return
                    console.log("Password matched ")

                    // if(result)
                    //    res.render('userProfile',{user:userData,successMessage:"Password Changed Sucessfully"});
                    //  else
                    //    res.render('userProfile',{user:userData,failedMessage:"Failed to change the password"});
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
        console.log(error.message)
    }
}

const changePasswordSendOtp = async(req,res)=>{
    try{
        const userData = await User.findById(req.session.user_id)
        console.log("changePasswordVerifyOtp Recieved")
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhilash.brototype@gmail.com',
                // pass: 'nfjy xgfz fyxo rimf',
                pass:'simf cqwp wvxj bent',

            },
        });

        const otp = OTP.generateOTP();
        req.session.changePassword = otp
        console.log("sendmail - generatd-otp:",otp)
        const mailOptions = {
            from: 'abhilash.brototype@gmail.com',
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
        console.log('Message sent: %s', info.messageId);
    }catch(error){
        console.log(error.message)
    }
}


const loadChangePasswordOtp = async (req,res) =>{
    try{
        res.render('otp2')
    }catch(error){
        console.log(error.message)
    } 
}

const clearOtp = async (req,res) =>{
    try{
       
        console.log("Clear otp recieved")
        console.log("session :",req.session.changePassword)
         delete req.session.changePassword
         req.session.save()
        console.log("After session :",req.session.changePassword)
        res.json({
            success: true,
            
        });

    }catch(error){
        console.log(error.message)
    }
}

const  changePasswordVerifyOtp = async (req,res)=>{
    try{

        const otpUser = req.body.otp.join("")
        const userId = req.session.user_id
        console.log("User otp :",otpUser)
        console.log("User otp :",req.session.changePassword) 
        console.log("User otp :",typeof(otpUser))
        if( otpUser === req.session.changePassword ){
                    const cpassword =  req.session.cpassword
                    const spass = await securePassword(cpassword)
                    const userData = await User.findById(userId)
                    console.log("spass :",spass)
                    const result = await User.findOneAndUpdate({_id:userId},{password:spass})
                    console.log("result :",result)
                    const orderData = await Order.find({userId:userId})
                    if(result){
                        res.render('userProfile',{user:userData,successMessage:"Password Changed Sucessfully",order:orderData});
                        delete req.session.changePassword
                        req.session.save()
                    }
                    else
                        res.render('userProfile',{user:userData,failedMessage:"Failed to change the password",order:orderData});
                        // delete req.session.email;
        }else{
            console.log("Wromg otp")
            res.render('otp2',{errorMessage:"Wrong password"})
        }
        
    }catch(error){
        console.log(error.message)
    }
}

const cancelOrder = async (req,res)=>{
    try{
        console.log("Cancel Order request recieved")
        const {orderId,index} = req.body
        console.log(req.body)
        console.log(orderId)
        const userId = req.session.user_id
        const cancelOrder = await Order.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"Cancelled"}},{new:true})
        console.log("Order data :",cancelOrder)
        if(cancelOrder){
        res.status(200).json({ success: true, successMessage: 'Product Cancelled sucesfully' });

        }

    }catch(error){
        console.log(error.message)
        res.status(500).json({ success: false, errorMessage: error.message });

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
    
        console.log(orderData)
        res.render('orderDetails' ,{order:orderData})
    } catch (error) {
        console.log(error.message)
    }
}


module.exports ={
    loadRegister,
    loadLogin,
    loadHome,
    verifyLogin,
    sendVerifyMail,
    loadOtp,
    verifyOTP,
    newInsertUser,
    loadotpRedirect ,
    loadRegsucess,
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
    loadOrderDetails
   
    

}
