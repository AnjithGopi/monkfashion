
const express = require('express')
const user_route = express();
const path = require('path');
const session = require('express-session');

const config = require("../config/config")
const seCode = config.sessionSecret;
user_route.use(session({
    secret:seCode,
    resave:false,
    saveUninitialized:false
}))

// const auth = require("../middleware/auth")

user_route.set('views', path.join(__dirname, '../views/users'));//path of View files 
user_route.use(express.urlencoded({extended: true}));
user_route.use(express.json())


const userController = require("../controllers/userController")

user_route.get('/register',userController.loadRegister);

user_route.post('/register',userController.sendVerifyMail);

user_route.get('/verifyotp',userController.loadOtp)

user_route.post('/verifyotp',userController.verifyOTP,userController.newInsertUser);

user_route.get('/login',userController.loadLogin);

user_route.post('/login',userController.verifyLogin);


user_route.get('/home',userController.loadHome);

user_route.get('/products',userController.loadProduct);



module.exports = user_route
