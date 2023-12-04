const Cart = require("../models/cartModal");
const Product = require("../models/productModal");
const User = require("../models/userModal");
const Order = require("../models/orderModel")

const { v4: uuidv4 } = require('uuid');





// .........................................................................................


function generateOrderId() {
    return uuidv4();
}

// function to genrate a unique orderId
// function generateOrderId() {
//     const timestamp = Date.now().toString();
//     const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

//     return `${timestamp}-${randomNum}`;
// }


// .........................................................................................


// Function to load the cart Page
const loadCart = async (req, res) => {
    try {
        // const cartData = await Cart.find({userId:req.session.user_id}).populate('product.productId');
        // console.log(cartData)
        // res.render('cart',{cart:cartData})
        const userId = req.session.user_id
        const userData = await User.findById(userId)

        //  Query to retrieve cart data with populated productId
        const cartData = await Cart.find({ userId: req.session.user_id })
            .populate("userId")
            .populate("product.productId"); // Populate the productId field in the product array

        console.log(cartData);
        console.log("User Data :", userData);
        // console.log(cartData[1])
        // console.log(cartData[0])
        console.log("........................");
        // console.log(cartData[0].product[0]);
        console.log("........................");

        // console.log(cartData[0].product[1].productId.name);
        console.log("........................");

        // console.log(cartData[0].quantity);
        // console.log(cartData.product);

        if (userData.cart) {
            res.render("cart", { cart: cartData });
        } else {
            const productData = await Product.find()
            //    console.log(productData)
            res.render('index', { product: productData, warningMessage: "Cart is empty" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

// Function to add Product to the cart
const addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user_id;
        console.log(productId);
        const productData = await Product.find();
        const cartUser = await Cart.findOne({ userId: req.session.user_id });
        console.log("session ID", req.session.user_id);
        console.log("Cart Data checking ", cartUser);
        // console.log("Product id In the cart  ;",cartUser.product[0].productId)
        if (cartUser) {
            // const productInCart = await cartUser.product({productId:productId})
            const productInCart = await Cart.find({
                userId: userId,
                product: { $elemMatch: { productId: productId } },
            });
            if (productInCart.length > 0) {
                console.log("product alerady exist in the cart:", productInCart);
                const result = await Cart.updateOne(
                    { userId: userId, "product.productId": productId },
                    { $inc: { "product.$.quantity": 1 } }
                );
                console.log(result);
                let message = 'Product quantity increased in cart successfully!';
                const productData = await Product.find()
                const cartCount = await Cart.find({ userId: req.session.user_id });


                res.status(200).render('index', { product: productData, message: message ,cartQuantity:cartCount[0].product.length || 0});

            } else {
                console.log("not in the cart");
                const result = await Cart.updateOne(
                    { userId: userId },
                    { $push: { product: { productId: productId, quantity: 1 } } }
                );
                console.log(result);
                let message = 'Product added to cart successfully!';
                const productData = await Product.find()
                const cartCount = await Cart.find({ userId: req.session.user_id });

                res.status(200).render('index', { product: productData, message: message,cartQuantity:cartCount[0].product.length || 0});

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
                // console.log("Added to cart sucessfully ", cartData);
                // const userData = await User.findById(userId)

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
                // console.log("cart data",cartData1)
                console.log("........................................")
                if(cartData1.length > 0){
                    // console.log("cc",cartData1[0].product.length)

                    cartCount = cartData1[0].product.length
                }

                res.status(200).render('index', { product: productData, message: message,cartQuantity:cartCount });

            } else {
                let message = 'Failed to add to the cart ';

                res.status(200).render('index', { product: productData, message: message, cartQuantity: 0});

            }
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

        // const cartData = await Cart.findOne({userId:req.session.user_id, 'product.productId': productId})
        const cartData = await Cart.findOne({
            userId: req.session.user_id,
            "product.productId": productId,
        }).populate("product.productId");
        console.log("cart data ", cartData);
        const quantityInCart = parseInt(req.body.quantity);

        const quantityToChange = parseInt(quantityChange);
        console.log(
            quantityInCart,
            quantityToChange,
            cartData.product[index].productId.stock
        );
        console.log("sum :", quantityToChange + quantityInCart);
        let sum = quantityInCart + quantityToChange;
        let totalStock = cartData.product[index].productId.stock;
        console.log("sum total-stock ", sum, totalStock);
        console.log("quantity in cart :", quantityInCart);

        const newQuantity = await Cart.findOne({ userId: req.session.user_id })
        console.log("newQuantity data ", newQuantity)
        const newQuantityInCart = newQuantity.product[index].quantity
        console.log(typeof (newQuantityInCart))
        const newSum = newQuantityInCart + quantityToChange
        if (newQuantityInCart >= 1 && newSum <= totalStock) {
            if (!(quantityChange == -1 && newQuantityInCart == 1)) {
                console.log("Before", cartData.product[index].quantity);
                // console.log( "QQQQQ  ...",cartData.product[0].productId.quantity)
                console.log(".............................");
                const newres = cartData.product.findIndex(
                    (product) => product.productId === productId
                );
                console.log(newres);
                console.log(".............................");

                // cartData.product[.productId.quantity+=quantityChange
                cartData.product[index].quantity += quantityChange;
                console.log("After :", cartData.product[index].quantity);
                // console.log("quantity of stock :",cartData.product[0].productId.stock)
                // console.log("quantity of stock :",cartData.product[0].productId)

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
        // if (result.nModified > 0) {
        //     // Display Toastr confirmation
        //     toastr.success('Product removed successfully.', 'Confirmation');

        // } 
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
        console.log("aadress : ", user.address)
        console.log("cart data :", cartData)
        res.render('checkout', { cartData: cartData, address: user.address })
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
        console.log("user Id :", userId)
        const { fullName, phone, phone2, houseName, state, city, pincode, landMark } = req.body;
        const user = await User.findById(userId)
        if (!user) {
            console.log("User Not found")
            return
        }
        const newAddress = {
            fullName: req.body.fname,
            phone: req.body.phoneNumber,
            phone2: req.body.phone2,
            houseName: req.body.cname,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,
            landMark: req.body.landMark
        };

        // Add the new address to the user's address array
        user.address.push(newAddress);

        // Save the user with the updated address array
        const updatedUser = await user.save();
        const cartData = await Cart.find({ userId: req.session.user_id })
            .populate("userId")
            .populate("product.productId");

        // console.log(updatedUser)
        console.log("cart data :", cartData)
        // console.log(cartData.product[0].productId.image[0])
        res.status(201).render('checkout', { cartData: cartData, address: updatedUser.address })
        // res.render('checkout',{cartData:cartData,address:user.address})

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
        const { addressIndex, paymentMethod } = req.body;
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
        console.log("total amount .. :", totalAmount);

        const orderId = generateOrderId();
        console.log("Order Id :", orderId);

        console.log("...........................................");
        const order = new Order({
            userId: userId,
            items: cartData.product,
            address: userAddress,
            paymentMethod: paymentMethod,
            orderId: orderId,
            totalAmount: totalAmount,
        });
        const orderData = await order.save();
        console.log("Order Data :", orderData);

        if (orderData) {
            const clearCart = await Cart.deleteOne({ _id: userData.cart });
            // console.log("cart cleared Data :",clearCart)

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

module.exports = {
    loadCart,
    addToCart,
    updateQuantity,
    removeItemFromCart,
    loadCheckout,
    addAddress,
    placeOrder
};
