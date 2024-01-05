const Cart = require("../models/cartModal");
const Product = require("../models/productModal");
const User = require("../models/userModal");
const Order = require("../models/orderModel")
const Coupon = require("../models/couponModal")
const Wallet = require("../models/walletModel")
const Categories = require("../models/categoriesModal")
const Banner = require("../models/bannerModal")
const walletController = require('../controllers/walletController')
const Razorpay = require('razorpay')
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const RAZORPAY_ID_KEY = process.env.RAZORPAY_KEY_ID
const RAZORPAY_ID_SECRET = process.env.RAZORPAY_KEY_SECRET




// .........................................................................................


function generateOrderId() {
    return uuidv4();
}


// .........................................................................................


// Function to load the cart Page
const loadCart = async (req, res) => {
    try {
        console.log("Load cart received")
        const userId = req.session.user_id
        const userData = await User.findById(userId)

        const cartData = await Cart.find({ userId: req.session.user_id })
            .populate("userId")
            .populate("product.productId"); // Populate the productId field in the product array

        console.log(cartData);
       
        if (userData.cart) {
            res.render("cart", { cart: cartData ,cartQuantity:cartData[0].product.length});
        } else {
            const productData = await Product.find({isDeleted:false,isActive:true}).limit(12)
             const newProducts = await Product.find({isDeleted:false,isActive:true}).sort({createdOn:1}).limit(10)
             const bannerData = await Banner.find()
        const userData = await User.findById(userId)

       const categoriesData = await Categories.find({isDeleted:false,isActive:true})

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
            res.render('index', { product: productData,userData:userData, warningMessage: "Cart is empty", newProducts:newProducts,banner:bannerData,categories:categoriesData,bestSeller:data });

        }
    } catch (error) {
        console.log(error.message);
    }
};

function findQuantityByProductId(cartData, productId) {
    const cartObject = cartData[0]; // Assuming there's only one object in the array
    
    if (cartObject) {

      for (const productItem of cartObject.product) {
        if (productItem.productId == productId) {
          return productItem.quantity;
        }
      }
    }
    return 0; 
  }

// Function to add Product to the cart
const addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user_id;
        console.log(productId);
        const productData = await Product.find();
        const currentProductData = await Product.findById(productId)
        const cartUser = await Cart.find({ userId: req.session.user_id });
        console.log("session ID", req.session.user_id);
        console.log("Cart Data checking ", cartUser);
        console.log("Current product data :",currentProductData)
        let quantity = 0
        if(  cartUser.length > 0){
        if (cartUser[0].product.length > 0){

            quantity = findQuantityByProductId(cartUser, productId)
        }
    }


        console.log("checkedProductCart quantity :",quantity)
        if( currentProductData.stock > quantity){
        if (cartUser.length > 0) {
            const productInCart = await Cart.find({
                userId: userId,
                product: { $elemMatch: { productId: productId } },
            });
            if (productInCart.length > 0 ) {
                console.log("product alerady exist in the cart:", productInCart);
                const result = await Cart.updateOne(
                    { userId: userId, "product.productId": productId },
                    { $inc: { "product.$.quantity": 1 } }
                );
                console.log(result);
                let message = 'Product quantity increased in cart successfully!';
                const productData = await Product.find()
                const cartCount = await Cart.find({ userId: req.session.user_id });
                res.status(200).json({
                    success: true,
                    productData,
                    cartQuantity: cartCount[0].product.length || 0,
                    message: message
                });


            } else {
                console.log("not in the cart");
                console.log(req.session.user_id)

                const result = await Cart.updateOne(
                    { userId: userId },
                    { $push: { product: { productId: productId, quantity: 1 } } }
                );
                console.log(req.session.user_id)
                console.log(result);

                let message = 'Product added to cart successfully!';
                const productData = await Product.find()
                const cartCount = await Cart.find({ userId: req.session.user_id });

                res.status(200).json({
                    success: true,
                    productData,
                    cartQuantity: cartCount[0].product.length || 0,
                    message: message
                });

                
            }
        } else {
            console.log("New cart Created");
            const newCart = new Cart({
                userId: req.session.user_id,
                product: [
                    {
                        productId: productId,
                        quantity: 1,
                    },
                ],
            });
            const cartData = await newCart.save();

            if (cartData) {
                console.log("Added to cart sucessfully ");
               

                const result = await User.updateOne(
                    { _id: userId },
                    { $set: { cart: cartData._id } }
                );

                if (result) {
                    console.log("Cart Id added to User Sucessfully ")
                }
                let message = 'Product added to cart successfully!';
                const productData = await Product.find()

                let cartCount = 0
                const cartData1 = await Cart.find({userId:req.session.user_id});
                console.log("........................................")
                if(cartData1.length > 0){

                    cartCount = cartData1[0].product.length
                }
                res.status(200).json({
                    success: true,
                    productData,
                    cartQuantity: cartData1[0].product.length || 0,
                    message: message
                });

            } else {
                let message = 'Failed to add to the cart ';
                res.status(500).json({
                    success: false,
                    productData,
                    cartQuantity: cartCount[0].product.length || 0,
                    warningMessage: message
                });

            }
        }
    }else{
        console.log("product out of stock")
        let message = 'Product Out of stock ';
        const cartCount = await Cart.find({ userId: req.session.user_id });
        res.status(500).json({
            success: false,
            productData,
            cartQuantity: cartCount[0].product.length || 0,
            warningMessage: message
        });

    }
    } catch (error) {
        console.log(error.message);
    }
};

const updateQuantity = async (req, res) => {
    try {
        console.log("fetch received :");
        const { productId, quantity, quantityChange, index } = req.body;
        console.log("product id ", productId);

        console.log(req.body);

        const cartData = await Cart.findOne({
            userId: req.session.user_id,
            "product.productId": productId,
        }).populate("product.productId");
        console.log("cart data ", cartData);
        const quantityInCart = parseInt(req.body.quantity);

        const quantityToChange = parseInt(quantityChange);
       
        console.log("sum :", quantityToChange + quantityInCart);
        let sum = quantityInCart + quantityToChange;
        let totalStock = cartData.product[index].productId.stock;

        const newQuantity = await Cart.findOne({ userId: req.session.user_id })
        console.log("newQuantity data ", newQuantity)
        const newQuantityInCart = newQuantity.product[index].quantity
        console.log(typeof (newQuantityInCart))
        const newSum = newQuantityInCart + quantityToChange
        if (newQuantityInCart >= 1 && newSum <= totalStock) {
            if (!(quantityChange == -1 && newQuantityInCart == 1)) {
                console.log("Before", cartData.product[index].quantity);
                console.log(".............................");
                const newres = cartData.product.findIndex(
                    (product) => product.productId === productId
                );
                console.log(newres);
                console.log(".............................");

                cartData.product[index].quantity += quantityChange;
                console.log("After :", cartData.product[index].quantity);
              
                const updateData = await cartData.save();

                console.log("data after updastion", updateData);
                res.json({
                    success: true,
                    updateData,
                    updatedQuantity: cartData.product[index].quantity,
                    message: 'Quantity updated'
                });
            } else {
                res.json({
                    success: false,
                    updateData,
                    updatedQuantity: cartData.product[index].quantity,
                    message: 'Unable to update'
                });
            }
        } else {
            console.log("Failed to update quantity");
            res.status(500).json({
                success: true, cartData,
                updatedQuantity: newQuantity.product[index].quantity, warningMessage: 'OUT OF STOCK'
            });

        }
    } catch (error) {
        console.log(error.message);
    }
};

// Function to remove the item from the cart
const removeItemFromCart = async (req, res) => {

    try {
        console.log("Delete Request received")
        console.log(req.params.id)
        const productToDeleteId = req.params.id
        const userId = req.session.user_id
        const userCartData = await Cart.find({ userId: userId })
        // const deleteData
        console.log(userCartData)
        const result = await Cart.updateOne(
            { userId: userId },
            { $pull: { product: { productId: productToDeleteId } } }
        );
        console.log(result)
        res.status(200).json({ success: true, message: 'Product removed successfully.' });

    } catch (error) {
        console.log(error.message)
    }
}

const loadCheckout = async (req, res) => {
    console.log("Checkout Loaded")
    try {
        const cartData = await Cart.find({ userId: req.session.user_id })
            .populate("userId")
            .populate("product.productId");
        const user = await User.findById(req.session.user_id)
        const couponData = await Coupon.find({isActive:true})
        const walletData = await Wallet.findOne({userId:req.session.user_id})
        console.log(couponData)
        res.render('checkout', { cartData: cartData, address: user.address ,coupon:couponData,walletBalance:walletData.balance || 0})
    } catch (error) {
        console.log(error.message)
    }
}

// To add address
const addAddress = async (req, res) => {
    console.log("Add address post received")
    // console.log(req.body)
    try {
        const userId = req.session.user_id
        console.log("user Id :",userId)
        console.log(typeof(req.body.phone))
        console.log(req.body)


        const user = await User.findById(userId)
        if(!user){
            console.log("User Not found")
            return
        }
        console.log("11")

        const newAddress = {
            fullName:req.body.name,
            phone:parseInt(req.body.phone),
            phone2:parseInt(req.body.phone2),
            houseName:req.body.house,
            state:req.body.state,
            city:req.body.city,
            pincode:parseInt(req.body.pincode),
            landMark:req.body.landMark
        };

        // Add the new address to the user's address array
        user.address.push(newAddress);

        // Save the user with the updated address array
        const updatedUser = await user.save();
  
        if( updatedUser){
            res.status(200).json({ success:true,successMessage:"Address Added Successfully "})
        }else{
            res.status(400).json({ success:false,warningMessage:"Failed to Add Address "})

        }

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Function to place the order
const placeOrder = async (req, res) => {
    try {
        console.log("Place order recieved");
        console.log(req.body);
        const { addressIndex, paymentMethod,paymentStatus,appliedCouponAmount,appliedWalletAmount } = req.body;
        console.log(
            "Address Index :",
            addressIndex,
            "Payment Index :",
            paymentMethod
        );
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const cartData = await Cart.findOne({ userId: userId });
        console.log("cartData", cartData);

        const userAddress = {
            fullName: userData.address[addressIndex].fullName,
            phone: userData.address[addressIndex].phone,
            phone2: userData.address[addressIndex].phone2,
            houseName: userData.address[addressIndex].houseName,
            state: userData.address[addressIndex].state,
            city: userData.address[addressIndex].city,
            pincode: userData.address[addressIndex].pincode,
            landMark: userData.address[addressIndex].landMark,
        };
        console.log("...........................................");
        const totalAmount = await calculateTotalPrice(cartData._id);

        const orderId = generateOrderId();

        console.log("...........................................");
        const order = new Order({
            userId: userId,
            items: cartData.product,
            address: userAddress,
            paymentMethod: paymentMethod,
            orderId: orderId,
            totalAmount: totalAmount,
            couponAmount:appliedCouponAmount,
            appliedWalletAmount:appliedWalletAmount
        });
        if(paymentStatus == "Success"){
            order.paymentStatus = "Success"
        }
        const orderData = await order.save();
        console.log("Order Data :", orderData);

        if (orderData) {
            const clearCart = await Cart.deleteOne({ _id: userData.cart});
            console.log("cart cleared Data :",clearCart)
            if(req.session.appliedCouponId ){
                console.log(req.session.appliedCouponId)
                console.log(typeof(req.session.appliedCouponId))
                const couponId =  new mongoose.Types.ObjectId(req.session.appliedCouponId)
                const addUserIdtoCoupon = await Coupon.findByIdAndUpdate({_id:couponId},{$push:{redeemedUsers:req.session.user_id}},{new:true}) 
                if(addUserIdtoCoupon){
                    console.log("Sucessfully added user id to coupon")
                }
            }
            if(appliedWalletAmount >0){
                const addToWallet = await walletController.debitFromWallet(appliedWalletAmount,userId)
                
            }
                
            updateStock();
            // clearing the cart refernce stored in the user data
            const clearCartFromUser = await User.updateOne(
                { _id: userId },
                { $unset: { cart: "" } }
            );
            res
                .status(200)
                .json({
                    success: true,
                    orderData:orderData,
                    successMessage: "Order Placed successfully.",
                });
        }



        // *****************************************FUNCTIONS*************************************************************
        // *************************************************************************************************************

        // to update stock price
        async function updateStock() {
            for (const product of cartData.product) {
                const productInfo = await Product.findById(product.productId);

                if (productInfo) {
                    // Update stock based on the quantity in the order
                    productInfo.stock -= product.quantity;

                    // Save the updated product info
                    await productInfo.save();
                }
            }
        }

        // Function to calculate the total  amount of the products in cart
        async function calculateTotalPrice(orderId) {
            try {
                const cart = await Cart.findById(orderId);

                if (!cart) {
                    console.log("cart not found");
                    return;
                }
                let totalPrice = 0;

                for (const product of cart.product) {
                    const productInfo = await Product.findById(product.productId);

                    if (productInfo) {
                        // Use salePrice if available, otherwise use regularPrice
                        const price = productInfo.salePrice || productInfo.regularPrice;
                        totalPrice += price * product.quantity;
                    }
                }

                console.log("Total Price:", totalPrice);
                return totalPrice;
            } catch (error) {
                console.error("Error:", error.message);
            }
        }

        //   ******************************************************************************************************
        //   ******************************************************************************************************

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, warningMessage: 'Some unwanted error occur at server .' });
    }
}

const razorpay = async (req,res)=>{
    try{
        console.log("razorpay controller function worked")
        console.log(".................................................")
        console.log(req.body)
        var instance = new Razorpay({ key_id:"rzp_test_RRdtrmEm8YKVJp", key_secret:"yvvaMyZtZ1ntBx0HIO42eUnQ" })
        const amount = parseInt(req.body.cartValue)*100
        console.log("Amount",amount)
        var options = {
        amount: amount,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
        };
        instance.orders.create(options, (err, order)=> {
        console.log(order);
        if(!err){
            console.log("! err worked")
            // order.key_id = RAZORPAY_ID_KEY;
            res
            .status(200)
            .json({
                success: true,
                orderData:order,
                key_id:RAZORPAY_ID_KEY,
                totalAmount:amount,
                successMessage: "Order Placed successfully.",
            });

        }else{
            console.log("errr found")
        }
        });
  


    }catch(error){
        console.log(error.message)
    }
}
const cancelSingleOrder = async (req,res)=>{
    try {
       console.log("cancel order single received") 
       console.log(req.body);
       const userId = req.session.user_id
       const {productId,orderId,cancelledQuantity,reason} = req.body
       const particularOrder = await Order.findById(orderId)
       
       const product = await Product.find({_id:productId})
       let appliedWalletAmount = 0;
       if(particularOrder.appliedWalletAmount){
        appliedWalletAmount = (particularOrder.appliedWalletAmount/particularOrder.totalAmount *product[0].salePrice)*cancelledQuantity;

       }
       let couponDiscount = (particularOrder.couponAmount/particularOrder.totalAmount *product[0].salePrice)*cancelledQuantity 
       console.log("Coupon Discount ",couponDiscount)
       const totalAmountOfCancelledProduct = product[0].salePrice * cancelledQuantity - couponDiscount;
       console.log("Total cancle amount :",totalAmountOfCancelledProduct) 
       
       const changeStatus = await Order.updateOne({_id:orderId,"items.productId":productId},{$inc:{'totalAmount':-totalAmountOfCancelledProduct},$set:{'items.$.productStatus':"Cancelled",'items.$.cancelledQuantity':cancelledQuantity,'items.$.reason':reason},$unset:{'items.$.quantity':0}})
       console.log("product after changing ",changeStatus.totalAmount)
       if(changeStatus){
          if(particularOrder.paymentStatus == "Success"){
              const addToWallet = await walletController.addToWallet(totalAmountOfCancelledProduct,userId)
              console.log("amount added to wallet ")
          }
           const increaseQuantity = await Product.findByIdAndUpdate({_id:productId},{$inc:{stock:cancelledQuantity}})
           console.log("increse stock quantity ",increaseQuantity)

           let message = " Order cancelled sucessfully"
            res.status(200).json({
                success:true,
                successMessage :message
            })
         }
      
    } catch (error) {
        console.log(error.message)
        
    }
}

const returnSingleOrder = async (req,res)=>{
    try {
        console.log("Return order single received") 
       console.log(req.body);
       const userId = req.session.user_id
       const {productId,orderId,returnedQuantity,reason} = req.body
       const particularOrder = await Order.findById(orderId)
       const product = await Product.find({_id:productId})
       const totalAmountOfReturnedProduct = product[0].salePrice * returnedQuantity;
       console.log("Total return amount :",totalAmountOfReturnedProduct) 
       
       const changeStatus = await Order.updateOne({_id:orderId,"items.productId":productId},{$inc:{'totalAmount':-totalAmountOfReturnedProduct},$set:{'items.$.productStatus':"Returned",'items.$.returnedQuantity':returnedQuantity,'items.$.returnedReason':reason},$unset:{'items.$.quantity':0}})
       console.log(changeStatus)
       console.log("product after changing ",changeStatus.totalAmount)
       if(changeStatus){
          if(particularOrder.paymentStatus == "Success"){
            // console.log("particular order data ",particularOrder)
              const addToWallet = await walletController.addToWallet(totalAmountOfReturnedProduct,userId)
              console.log("amount added to wallet ")
          }
           const increaseQuantity = await Product.findByIdAndUpdate({_id:productId},{$inc:{stock:returnedQuantity}})
           console.log("incresed stock quantity ",increaseQuantity)

           let message = " Order Returned sucessfully"
            res.status(200).json({
                success:true,
                successMessage :message
            })
         }
      

    } catch (error) {
        console.log(error.message)
        
    }
}

module.exports = {
    loadCart,
    addToCart,
    updateQuantity,
    removeItemFromCart,
    loadCheckout,
    addAddress,
    placeOrder,
    razorpay,
    cancelSingleOrder,
    returnSingleOrder
};