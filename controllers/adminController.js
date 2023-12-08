// const { default: orders } = require("razorpay/dist/types/orders");
const Order = require("../models/orderModel");
const Product = require("../models/productModal");
const User = require("../models/userModal")

const bcrypt = require('bcrypt')

require("dotenv").config();


    const loadLogin = async(req,res)=>{
        try{
            res.render('login')
        }catch(error){
            console.log(error.message)
        }
    }
    
const logout = async (req,res)=>{
    try{
        req.session.destroy(err => {
            if (err) {
              console.error('Error destroying session:', err);
              res.status(500).send('Internal Server Error');
            } else {
            
              res.redirect('/admin');
            }
          })
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
                    req.session.admin = adminData;
                    res.redirect("/admin/home")
                    // res.end("Sucessfull")
                    // res.render('index')
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

const loadHome = async(req,res)=>{
    try {
        const userCount = await User.countDocuments({isActive:true,isAdmin:false})
        const productCount = await Product.countDocuments({isActive:true,isDeleted:false})
        const orderCount = await Order.countDocuments()
        console.log(userCount)
        res.render('index',{userCount,productCount,orderCount})
    } catch (error) {
        console.log(error.message)
        
    }
}

const loadUserList = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        var search = '';
        if(req.query.search){
            search = req.query.search;
        }


        const userData = await User.find({isAdmin:false,
        
            $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}},
                {email:{$regex:'.*'+search+'.*',$options:'i'}}
            ]

        })
        .skip(skip)
        .limit(limit);
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);
        // console.log("USer dataaa",userData)
        res.render('user-list',{users:userData,currentPage: page,totalPages: totalPages,})
    }catch(error){
        console.log(error.message)
    }
}

const changeStatus = async (req,res)=>{
    try{
        const id =req.query.id;
        const admin = req.query.admin;
       const userSessionId = process.env.SESSION_SECRET_KEY
        const updateValue = admin === "true" ? false : true;

        const statusUpdation =  await User.findByIdAndUpdate({_id:id},{$set:{isActive:updateValue}})


        if (statusUpdation) {
            const message = `User ${updateValue ? 'activated' : 'blocked'} successfully.`;
            console.log(message);
    
            // Destroy the user session if blocking the user
            if (!updateValue) {
                if (req.session.user_id) {
                    delete req.session.user_id
                    req.session.save()
                
                    // if ( !data) {
                    //     console.error('Error destroying session:', err);
                    //     res.status(500).send('Internal Server Error');
                    // } else {
                    //     console.log("loading rendereing")
                    // }
                    res.redirect('/admin/userList');
            
            } else{
                res.redirect('/admin/userList');
            }
         } else {
                res.redirect('/admin/userList');
            }
        } else {
            console.error('User not found or update failed.');
            res.status(404).send('User not found or update failed.');
        }

    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}

// Load orders Page

const loadOrders = async (req,res) =>{
    try {
        const orderData = await Order.find({})
        res.render('orders',{order:orderData})
    } catch (error) {
        console.log(error.message)
    }
}

// chnage order status

const changeOrderStatus = async (req,res) =>{
    try{
        console.log("Order change status recieved")
        console.log("Body :",req.body)
        const {id,index,status} = req.body
        const updatedStatus = await Order.findByIdAndUpdate(id,{orderStatus:status},{new:true})
        console.log("updated data:",updatedStatus)
        console.log("updated status:",updatedStatus.orderStatus)
        if(updatedStatus){
        res.status(200).json({ success: true, changedOrderStatus:updatedStatus.orderStatus,successMessage: 'Status Changed Successfully'});
        }
    }catch(error){
        console.log(error.message)
        res.status(500).json({ success: false, warningMessage: 'Some unwanted error occur at server .' });

    }
}

const loadOrderDetails = async (req,res)=>{
    try {
        console.log("View Order details received in admin ")
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

const loadSalesReport = async (req,res)=>{
    try {
        var search = '';
        var startDate = null;
        var endDate =null ;
        // var category = '';
        const userCount = await User.countDocuments({isActive:true})

        if(req.query.search){
            search = req.query.search;
        }
        console.log("Search Key :",search)
        if( req.query.fromDate && req.query.toDate){
            startDate = new Date(req.query.toDate)
            endDate =new Date(req.query.fromDate)
        const dateData = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { orderDate: { $gt:new Date(req.query.fromDate),$lt:new Date(req.query.toDate) } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $sort:{
                    orderDate:-1
                }
            }
        ]);
        const orderCounts =  getSalesReportCounts(dateData)
        res.render("salesReport",{orders:dateData,users:userCount,totalOrders:dateData.length,onlinePayments:orderCounts.filterPaymentOnline,offlinePayments:orderCounts.filterPaymentOffline,cancelledOrders:orderCounts.filterOrderCancelled,totalAmount:orderCounts.totalSum})

        res.render("salesReport",{orders:dateData})
        return

        }

        const orderData = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { orderId: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { totalAmount: { $eq: parseFloat(search) } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $sort:{
                    orderDate:-1
                }
            }
            
              
            //   console.log("order Data " ,orderData.length);
            // // console.log(orderData[1].orderDate)
            // console.log(startDate)
            // console.log(new Date(endDate))
            // console.log(endDate)
            // const dateData = await Order.find({orderDate: { $gte: startDate }})
    
            // const dateData = await Order.find({ orderDate: { $gt:new Date(req.query.fromDate),$lt:new Date(req.query.toDate) } })
    // console.log(dateData);
    
            // console.log("order dat ::: " ,dateData.length);
        ]);


        const orderCounts = getSalesReportCounts(orderData)
        console.log("SlaesData :",orderCounts)
        const k = orderCounts

        res.render("salesReport",{orders:orderData,users:userCount,totalOrders:orderData.length,onlinePayments:orderCounts.filterPaymentOnline,offlinePayments:orderCounts.filterPaymentOffline,cancelledOrders:orderCounts.filterOrderCancelled,totalAmount:orderCounts.totalSum})
    } catch (error) {
        console.log(error.message)
        
    }

    function getSalesReportCounts(orderData){
                  
        const filterPaymentOnline = orderData.filter(obj => obj.paymentMethod === "Online");
        const filterPaymentOffline = orderData.filter(obj => obj.paymentMethod === "Cash On Delivery");
        const filterOrderCancelled = orderData.filter(obj => obj.orderStatus === "Cancelled");
        const totalSum = orderData.reduce((sum,obj) => {
        return sum+=obj.totalAmount
        },0)

        console.log(filterPaymentOnline.length);
        console.log(filterPaymentOffline.length);
        console.log(filterOrderCancelled.length);
        console.log(totalSum)
        let salesData={
            filterPaymentOnline:filterPaymentOnline.length,
            filterPaymentOffline:filterPaymentOffline.length,
            filterOrderCancelled:filterOrderCancelled.length,
            totalSum:totalSum
        }
        return salesData
    }
}

module.exports ={
   loadLogin,
   verifyLogin,
   loadHome,
   logout,
   loadUserList,
   changeStatus,
   loadOrders,
   changeOrderStatus,
   loadOrderDetails,
   loadSalesReport
  
}
    
