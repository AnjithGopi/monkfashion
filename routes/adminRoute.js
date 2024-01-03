const express = require('express')
const admin_route = express()
const path = require('path')
const session = require('express-session');
const Multer = require('../config/multer')


admin_route.set('view engine','ejs')

admin_route.set('views', path.join(__dirname, '../views/admin'));//path of View files 
admin_route.use(express.urlencoded({extended: true}));
admin_route.use(express.json())
// env
require("dotenv").config();
KEY = process.env.SESSION_SECRET_KEY_ADMIN

admin_route.use(session({
    secret:KEY,
    resave:false,
    saveUninitialized:false
}))


// Authentication middlewares
const auth = require("../middleware/adminAuthentication")


// importing inbuild contoller modules
const adminController = require("../controllers/adminController")
const categoriesController = require("../controllers/categoriesController")
const productController = require("../controllers/productController")
const couponController = require("../controllers/couponController")
const offerController = require("../controllers/offerContoller")
const bannerController = require("../controllers/bannerController")

admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',auth.isLogin,adminController.loadHome);
admin_route.get('/logout',auth.isLogin,adminController.logout);
admin_route.get('/userList',auth.isLogin,adminController.loadUserList);
admin_route.get('/changeStatus',auth.isLogin,adminController.changeStatus);

// Admin Categories Management
admin_route.get('/categories',auth.isLogin,categoriesController.loadCategories);
admin_route.post('/categories',categoriesController.addCategories);
admin_route.get('/categories/editCategories',auth.isLogin,categoriesController.loadEditCategories);
admin_route.post('/categories/editCategories',auth.isLogin,Multer.uploadCategory.array('image',2), categoriesController.editCategories);
admin_route.get('/blockCategories',auth.isLogin,categoriesController.changeCategoriesStatus);
admin_route.get('/deleteCategories',auth.isLogin,categoriesController.deleteCategories);

// Admin Product Management
admin_route.get('/addproduct',auth.isLogin,productController.loadAddProduct);
admin_route.post('/addproduct',auth.isLogin,Multer.upload.array('image',5),productController.insertProduct);
admin_route.get('/products',auth.isLogin,productController.loadProduct)
admin_route.get('/products/changeStatus',auth.isLogin,productController.changeStatus);
admin_route.get('/products/deleteProduct',auth.isLogin,productController.deleteProduct);
admin_route.get('/products/editProduct',auth.isLogin,productController.loadEditProduct);
admin_route.post('/products/editProduct',auth.isLogin,Multer.upload.array('image',5),productController.editProduct)

admin_route.get('/orders',auth.isLogin,adminController.loadOrders)
admin_route.post('/orders/changeStatus',auth.isLogin,adminController.changeOrderStatus)
admin_route.get('/orders/orderDetails',auth.isLogin,adminController.loadOrderDetails)

// Admin Dashboard
admin_route.get('/dashboard/salesReport',adminController.loadSalesReport)
admin_route.get('/home/chart',auth.isLogin,adminController.loadChart);

// Admin Coupon Management
admin_route.get('/coupon',auth.isLogin,couponController.loadCoupon)
admin_route.post('/coupon/createCoupon',auth.isLogin,couponController.createCoupon)
admin_route.patch('/coupon/changeStatus',auth.isLogin,couponController.changeCouponStatus)

// Admin Product Offers
admin_route.get('/productOffer',auth.isLogin,offerController.loadProductOffer)
admin_route.patch('/productOffer/changeStatus',auth.isLogin,offerController.productOfferChangestatus)
admin_route.patch('/productOffer/applyOffer',auth.isLogin,offerController.applyProductOffer)
admin_route.get('/categoriesOffer',auth.isLogin,offerController.loadCategoriesOffer)
admin_route.patch('/categoriesOffer/changeStatus',auth.isLogin,offerController.categoriesOfferChangestatus)
admin_route.patch('/categoriesOffer/applyOffer',auth.isLogin,offerController.applyCategoryOffer)

// Admin Banner management
admin_route.get('/banner',bannerController.loadBanner)
admin_route.post('/banner/addBanner',Multer.uploadBanner.array('image',5),bannerController.addBanner)
admin_route.post('/banner/updateBanner',Multer.uploadBanner.array('image',5),bannerController.updateBanner)


// admin_route.use('*', (req, res) => {
//     res.status(404).json({
//       success: 'false',
//       message: 'Page not found',
//       error: {
//         statusCode: 404,
//         message: 'You reached a route that is not defined on this server',
//       },
//     });
//   });

module.exports = admin_route