
// multer configuration
const multer = require('multer')
const path  = require('path')

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.join(__dirname,'../public/admin/images/product'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+ file.originalname;
        
        cb(null,name);

    }
    
});

const storageBanner = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.join(__dirname,'../public/admin/images/banner'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+ file.originalname;
        
        cb(null,name);

    }
    
});

const storageCategory = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.join(__dirname,'../public/admin/images/category'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+ file.originalname;
        
        cb(null,name);

    }
});

const upload = multer({storage:storage})
const uploadBanner = multer({storage:storageBanner})
const uploadCategory = multer({storage:storageCategory})

module.exports ={
    upload,
    uploadBanner,
    uploadCategory
}