// const { stat } = require('fs')
const Coupon = require('../models/couponModal')
// const { changeStatus } = require('./adminController')
// Assuming couponId is an ObjectId, you can create it using mongoose.Types.ObjectId
const mongoose = require('mongoose');

const loadCoupon = async(req,res)=>{
    try{
        const couponData = await Coupon.find().sort({timestamp:-1})
        res.render('coupon',{coupon:couponData})
    }catch(error){
        console.log(error.message)
    }
}

const createCoupon = async(req,res)=>{
    try{
        console.log("Create Coupon received")
        console.log(req.body)
        
        const { name,couponId,minimumAmount,discountAmount,limit,expirationDate}  = req.body
        // const nameAndId = await Coupon.find({name:name,couponId:couponId})
        const existingCoupon = await Coupon.find({ $or: [{ name: name }, { code: couponId }] });
        if(!existingCoupon.length > 0){
            const coupon = new Coupon({
                name:name,
                code:couponId,
                minimumPurchase:minimumAmount,
                discountAmount:discountAmount,
                limit:limit,
                expirationDate:expirationDate

            })
            const createCoupon = await coupon.save()
            if(createCoupon){
                console.log("Coupon created successfully")
                let message = "Coupon created successfully"
                res.status(200).json({success:true,successMessage:message})
            }
        }else{
            console.log("Coupon creation Failes")

            let errorMessage = '';

            if (existingCoupon.some(coupon => coupon.name === name)) {
                errorMessage += 'Name already exists. ';
            }

            if (existingCoupon.some(coupon => coupon.code === couponId)) {
                errorMessage += 'Coupon ID already exists.';
            }
            res.status(500).json({success:false,warningMessage:errorMessage})
        }

        // res.render('coupon',{categories:""})
    }catch(error){
        console.log(error.message)
    }
}

const changeCouponStatus = async(req,res)=>{
    try {
        console.log("Change status received")
        console.log(req.body)
        const { couponId , status } = req.body
        console.log(req.body.status)
        console.log(typeof(req.body.status))
        let changeStatus = status == "true"? false : true;
        console.log("change status :",changeStatus)
        let couponid = new mongoose.Types.ObjectId(couponId)


    //   let couponid = JSON.stringify(req.body.couponId);
    const updatedCoupon = await Coupon.findOneAndUpdate(
        { _id:couponid  },
        { $set: { isActive: changeStatus } },
        { new: true }
    );
    console.log(updatedCoupon)
    if(updatedCoupon){
        res.status(200).json({successMessage:"Status changed successfully",status:changeStatus})      
        return
    }
    res.status(500).json({warningMessage:"Failed to link the status",status:changeStatus})
    } catch (error) {
        console.log(error.message)
        
    }
}

// Apply Coupon
const applyCoupon = async (req,res)=>{
    try {
        console.log("Apply coupon received")
        console.log(req.body)
        const {couponId ,totalAmount }= req.body
        const couponData = await Coupon.findOne({code:couponId})
        console.log(couponData)
        const userId = req.session.user_id
        var message = ""
        if(couponData && !couponData.isDeleted){
            console.log("Coupon find")
            const countOfUser = couponData.redeemedUsers.filter(item => item ==userId).length
            console.log("Count of used :", countOfUser)
            if( countOfUser <= couponData.limit){
                if( totalAmount >= couponData.minimumPurchase ){
                    const amountAfterApplyingCoupon = totalAmount-couponData.discountAmount
                    req.session.appliedCouponId = couponData._id
                    res.status(200).json({success:true,couponAmount:couponData.discountAmount,amountAfterApplyingCoupon:amountAfterApplyingCoupon,successMessage:"Coupon Applied successfully"})
                }else{
                    res.status(500).json({success:false,warningMessage:"failed to apply coupon"})
                }
            }else{
                res.status(500).json({success:false,warningMessage:"Coupon limit exceeded"})
            }
        }else{
            console.log("Coupon not available")
            res.status(500).json({success:false,warningMessage:"Coupon not available"})

        }
        
    } catch (error) {
        console.log(error.message)
        
    }
}
// const job = require('../cronJob')
// job.add

const schedule = require('node-schedule')


schedule.scheduleJob('*/2 * * * * *',async ()=>{
    // console.log("Job  .. ")
    try {
        const result = await Coupon.updateMany(
            {
                expirationDate: { $lte: new Date() },
                
            },
            { $set: { isDeleted:true  } }
        );
    
    
        if (result.nModified > 0) {
            console.log('Expired coupons updated successfully.');
        } else {
            // console.log('No expired coupons found.');
        }
    } catch (error) {
        console.log(error.message)
    }
})


module.exports ={
    loadCoupon,
    createCoupon,
    changeCouponStatus,
    applyCoupon
}

