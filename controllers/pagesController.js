const Message = require('../models/messagesModel')

const loadContact = async (req, res) => {
    try {
       res.render('../pages/contact') 
    } catch (error) {
        console.log(error.message);
    }
};

const submitMessage = async (req, res) => {
    try {
        console.log('1')
        console.log(req.body)
        const {name,email,mobile,subject,content} = req.body
        const saveMessage = new Message({name:name,email:email,mobile:parseInt(mobile),subject:subject,content:content})
        const messageData = await saveMessage.save()


        console.log(saveMessage)

        if(messageData){
            res.status(200).json({success:true,message:"Message Send Successfully"})
        }else{
            res.status(400).json({success:false,message:"Failed to Send the Message"})
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadAbout = async (req, res) => {
    try {
        res.render('../pages/about') 
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadContact,
    submitMessage,
    loadAbout
}