const express = require('express')
const admin_route = express()
const path = require('path')

admin_route.set('view engine','ejs')

admin_route.set('views', path.join(__dirname, '../views/admin'));//path of View files 
admin_route.use(express.urlencoded({extended: true}));
admin_route.use(express.json())


const adminController = require("../controllers/adminController")

admin_route.get('/',adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/userList',adminController.loadUserList);
admin_route.get('/changeStatus',adminController.changeStatus);



module.exports = admin_route