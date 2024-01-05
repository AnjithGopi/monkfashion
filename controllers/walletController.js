const Order = require("../models/orderModel");
const Product = require("../models/productModal");
const Wallet = require("../models/walletModel")

const bcrypt = require('bcrypt');

async function addToWallet(amount,userId){
    try{
        console.log("add to wallet received")

        // const userId = req.session.user_id
        const userWallet = await Wallet.find({userId:userId})
        console.log("user wallet data",userWallet)
        if(userWallet.length > 0){
            const addAmount = await Wallet.updateOne({userId:userId},{$inc:{balance:amount},$push:{transaction:{amount:amount,mode:"Credited"}}})
            console.log("Amount added to wallet")
            return true
        }else{
            console.log("wallet not created till now")
            const wallet = await createUserWallet(userId)
            if(wallet){
             const addAmount = await Wallet.updateOne({userId:userId},{$inc:{balance:amount},$push:{transaction:{amount:amount,mode:"Credited"}}})
             console.log("Amount added to wallet")
                return true
            }else{
             console.log("Failed to create wallet")
             return false
            }
        }
    }catch(error){
        console.log(error.message)
    }
}

async function debitFromWallet(amount,userId){
    try{
        console.log("add to wallet received")

        // const userId = req.session.user_id
        const userWallet = await Wallet.find({userId:userId})
        console.log("user wallet data",userWallet)
        if(userWallet.length > 0){
            const addAmount = await Wallet.updateOne({userId:userId},{$inc:{balance:-amount},$push:{transaction:{amount:amount,mode:"Debited"}}})
            console.log("Amount debited from wallet")
            return true
        }else{
            console.log("Wallet Not Exist !!")
            
        }
    }catch(error){
        console.log(error.message)
    }
}

async function createUserWallet(userIdd){
    try{
        console.log("create wallet received")
        const newWallet = new Wallet({
            userId:userIdd
        })
        const createWallet = await newWallet.save()
        if(createWallet){
            console.log("wallet created sucesfully")
            return true
        }else{
            return false
        }
    }catch(error){
        console.log(error.message)
    }
}

module.exports = {
    addToWallet,
    debitFromWallet,
    createUserWallet
}