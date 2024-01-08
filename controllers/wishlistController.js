const Wishlist = require("../models/wishlistModal")
const Product =  require("../models/productModal")
const mongoose = require('mongoose')
const loadWishlist = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId( req.session.user_id)
        const wishlistData = await Wishlist.aggregate([
                                    {
                                        $match:{userId:userId}
                                    },
                                    {
                                        $lookup: {
                                            from: 'products',
                                            localField: 'product.productId',
                                            foreignField: '_id',
                                            as: 'productDetails'
                                        }
                                    }
                                
        ])
        res.render('wishlist',{wishlistData:wishlistData})
    } catch (error) {
        res.render('../pages/error',{error:error.message})
    }
};

const addToWishlist = async (req, res) => {
    try {
        
        const userId = new mongoose.Types.ObjectId(req.session.user_id);

        const productId = new mongoose.Types.ObjectId(req.params.productId);
        const checkWishlistExist = await Wishlist.findOne({userId:userId})
        if(!checkWishlistExist){
            await createWishlist(req,res)
        }
        const findWishlist = await Wishlist.findOne({userId:userId})
        const productInWishlist = await Wishlist.find({
            userId: userId,
            product: { $elemMatch: { productId: productId } },
        });
        if (productInWishlist.length <= 0 ){
        findWishlist.product.push({productId:productId})
           const saveWishlist = await findWishlist.save() 
           if(saveWishlist){
            res.status(200).json({success:true,message:"Product added to the Wishlist"})
           }else{
           res.status(400).json({success:false,message:"Failed to add to wishlist"})
           }
        }else{
           res.status(400).json({success:false,message:"Product allready in the Wishlist"})
        }
        

    } catch (error) {
        res.render('../pages/error',{error:error.message})
    }
};

const createWishlist = async (req,res) =>{
    try{
        const userId = new mongoose.Types.ObjectId(req.session.user_id);
        const newWishlist = new Wishlist({
            userId : userId
        })
        const wishlistData = await newWishlist.save()
        if(wishlistData){
            return true
        }
        return false
    }catch (error){
        res.render('../pages/error',{error:error.message})
    }
}

const removeProduct = async (req, res) => {

    try {
       
        const productToDeleteId = req.params.productId
        const userId = req.session.user_id
      
        const result = await Wishlist.updateOne(
            { userId: userId },
            { $pull: { product: { productId: productToDeleteId } } }
        );
        if(result.modifiedCount > 0){
            res.status(200).json({ success: true, message: 'Product removed successfully.' });
        }else{
            res.status(401).json({ success: false, message: 'Failed to remove Product.' });
        }

    } catch (error) {
        res.render('../pages/error',{error:error.message})
    }
}

module.exports ={ 
    loadWishlist,
    addToWishlist,
    createWishlist,
    removeProduct
}

