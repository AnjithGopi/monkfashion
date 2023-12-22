
const express = require('express')
const user_route = express();
const path = require('path');
const session = require('express-session');

const config = require("../config/config")
const seCode = config.sessionSecret;

// env
require("dotenv").config();
KEY = process.env.SESSION_SECRET_KEY

user_route.use(session({
    secret:KEY,
    resave:false,
    saveUninitialized:false
}))


user_route.set('views', path.join(__dirname, '../views/users'));//path of View files 
user_route.use(express.urlencoded({extended: true}));
user_route.use(express.json())

// importing the auth middlewate to the auth variable
const auth = require("../middleware/userAuthentication")

// importing the  userController module to usercontroller variable
const userController = require("../controllers/userController")

// importing the orderController module to orderController
const orderController = require("../controllers/orderController")

// importing the coupon Controller
const couponController = require("../controllers/couponController")


user_route.get('/',userController.loadHome);
// router to load registration form
user_route.get('/register',auth.isLogout,userController.loadRegister);
// Router to submit the registration form
user_route.post('/register',userController.sendVerifyMail);
// Router to load the verify Otp page
user_route.get('/verifyotp',auth.isLogout,userController.loadOtp)
// Rotute to check the submited otp
user_route.post('/verifyotp',userController.verifyOTP,userController.newInsertUser);
// Route to load the login page
// user_route.get('/login',auth.isLogout,userController.loadLogin);
user_route.get('/login',auth.isLogout,userController.loadLogin);
// Route to verify the login
user_route.post('/login',userController.verifyLogin);
// Route to load the home page
user_route.get('/home',userController.loadHome);
// Route to load the single product 
user_route.get('/products',auth.isLogin,userController.loadProduct);
// Route to view all Products
user_route.get('/home/allProducts',auth.isLogin,userController.loadAllProducts);
// Route to Logout the User
user_route.get('/logout',auth.isLogin,userController.logoutUser)
// To Load the Cart page
user_route.get('/user/cart',auth.isLogin,orderController.loadCart)
// to add a product to Cart
user_route.get('/user/addtoCart/:id',auth.isLogin,orderController.addToCart)
user_route.get('/user/product/addtoCart/:id',auth.isLogin,orderController.addToCart)

// fetch
user_route.post('/update-quantity',auth.isLogin,orderController.updateQuantity)

// to remove the items from cart
user_route.delete('/remove-item/:id',auth.isLogin,orderController.removeItemFromCart)

// to checkout
user_route.get('/home/cart/checkout',auth.isLogin,orderController.loadCheckout)
user_route.post('/home/cart/checkout/applyCoupon',auth.isLogin,couponController.applyCoupon)
// Add address.
user_route.post('/addAddress',auth.isLogin,orderController.addAddress)
// user_route.get('/addAddress',orderController.addAddress)

user_route.post('/home/cart/checkout/placeorder',auth.isLogin,orderController.placeOrder)
user_route.post('/home/cart/checkout/razorpay',auth.isLogin,orderController.razorpay)

// User profile
user_route.get('/home/profile',auth.isLogin,userController.loadProfile)
user_route.post('/home/profile/addAddress',auth.isLogin,userController.addAddress)
// to remove address
user_route.delete('/remove-address/:index',auth.isLogin,userController.removeAddress)
// Edit address
user_route.get('/home/profile/editAddress',auth.isLogin,userController.loadEditAddress)
// update Edit address
user_route.post('/home/profile/editAddress',auth.isLogin,userController.editAddress)
// Load Update User Profile
user_route.get('/home/profile/editProfile',auth.isLogin,userController.loadUpdateUserProfile)
// update user profile 
user_route.post('/home/profile/editProfile',auth.isLogin,userController.updateUserProfile)
// To change user Password
user_route.get('/home/profile/changePassword',auth.isLogin,userController.loadChangePassword)
user_route.post('/home/profile/changePassword',auth.isLogin,userController.verifyChangePasword,userController.changePasswordSendOtp,userController.changePasswordVerifyOtp)
user_route.get("/home/profile/updateProfile/otp",auth.isLogin,userController.loadChangePasswordOtp)
user_route.post("/home/profile/updateProfile/otp",auth.isLogin,userController.changePasswordVerifyOtp)
user_route.post("/home/profile/cancelOrder",auth.isLogin,userController.cancelOrder)
user_route.get("/home/profile/order/orderDetails",auth.isLogin,userController.loadOrderDetails)
user_route.post("/home/profile/order/orderDetails/cancelOrder",auth.isLogin,orderController.cancelSingleOrder)
user_route.post("/home/profile/order/orderDetails/returnOrder",auth.isLogin,orderController.returnSingleOrder)


user_route.post("/clearOtp",auth.isLogin,userController.clearOtp)
// user_route.p("/clearOtp",auth.isLogin,userController.clearOtp)

// user_route.use('*', (req, res) => {
//     res.status(404).json({
//       success: 'false',
//       message: 'Page not found',
//       error: {
//         statusCode: 404,
//         message: 'You reached a route that is not defined on this server',
//       },
//     });
//   });


module.exports = user_route
