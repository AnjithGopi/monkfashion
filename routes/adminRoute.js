const express = require('express')
const admin_route = express()
const path = require('path')

admin_route.set('view engine','ejs')

admin_route.set('views', path.join(__dirname, '../views/admin'));//path of View files 
admin_route.use(express.urlencoded({extended: true}));
admin_route.use(express.json())

// multer configuration
const multer = require('multer')

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.join(__dirname,'../public/admin/images/product'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+ file.originalname;
        
        cb(null,name);

    }
});

const upload = multer({storage:storage})

// importing inbuild modules
const adminController = require("../controllers/adminController")
const categoriesController = require("../controllers/categoriesController")
const productController = require("../controllers/productController")

admin_route.get('/',adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/userList',adminController.loadUserList);
admin_route.get('/changeStatus',adminController.changeStatus);
admin_route.get('/categories',categoriesController.loadCategories);
admin_route.post('/categories',categoriesController.addCategories);
admin_route.get('/blockCategories',categoriesController.changeCategoriesStatus);
admin_route.get('/deleteCategories',categoriesController.deleteCategories);
admin_route.get('/addproduct',productController.loadAddProduct);
admin_route.post('/addproduct',upload.single('image'),productController.insertProduct);



module.exports = admin_route