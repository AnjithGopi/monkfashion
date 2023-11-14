const User = require('../models/userModal')
const OTP = require('../functions/generateOTP')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { nextTick } = require('process');

const securePassword = async(password)=>{

    try{
        const passwordHash = await bcrypt.hash(password,10);
        
        return passwordHash;
    }catch(error){
        console.log(error.message)
    }
}

// // For sending mail
// const sendVerifyMail = async(name,email,user_id)=>{
//     try{
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'abhilash.brototype@gmail.com',
//                 pass: 'nfjy xgfz fyxo rimf',
//             },
//         });

//         const otp =1111;
//         const mailOptions = {
//             from :'abhilash.brototype@gmail.com',
//             to:email,
//             subject:'for verification mail',
//             html:`Your verification code is : ${otp}`,
//         }

//       // Send mail with defined transport object
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//         return console.error(error);
//         }
//         console.log('Message sent: %s', info.messageId);
//     });

//     }catch (error){
//         console.log(error.message)
//     }
// }


const sendVerifyMail = async (req,res) => {
    try {

        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            // If the email already exists, render an error message
            return res.render('registration', { emailexistmessage: "Email already exists. Choose a different email." });
        }

        req.session.name = req.body.name;
        req.session.email = req.body.email;
        req.session.mobile = req.body.mobile;
        req.session.password= req.body.password;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhilash.brototype@gmail.com',
                // pass: 'nfjy xgfz fyxo rimf',
                pass:'simf cqwp wvxj bent',

            },
        });

        const otp = OTP.generateOTP();
        req.session.otp = otp
        console.log("sendmail - generatd-otp:",otp)
        const mailOptions = {
            from: 'abhilash.brototype@gmail.com',
            to: req.body.email,
            subject: 'Verification Mail',
            html: `Your verification code is: ${otp}`,
        };

        // Use Promise style for sending mail
        const info = await transporter.sendMail(mailOptions);

        console.log('Message sent: %s', info.messageId);
        res.redirect('/verifyotp')

    } catch (error) {
        console.error('Error sending email:', error.message);
        
    }

};

const loadotpRedirect = async(req,res)=>{
    try{
        res.redirect('/verifyotp')

    }catch(error){
        console.log(error.message)
    }
}



const loadOtp = async(req,res)=>{

    try{
    //    const userData = await User.findById({_id:req.session.user_id})
    // res.setHeader('Custom-Header', '/htmlotp'); 
    // res.setHeader('')
        res.render('otp');
    }catch(error){
        console.log(error.message)
    }
    // next()
}

const verifyOTP = async (req,res,next)=>{
    const userEnteredOtp = req.body.otp;

    console.log("verify-user-otp:",userEnteredOtp)
    console.log("verify-session-otp :",req.session.otp)
    try{
        if(userEnteredOtp === req.session.otp){
            console.log('verification sucessfull')
            // res.render('registrationSucess')
             next()
        }else{
            console.log('verification failed')
            // res.render('otp',{message:" otp is incorrect"})
            return

        }
    }catch(error){
        console.log("verify otp sending error :",error.message)
    }
    
};

const loadRegsucess = async (req,res) =>{
    try{
        res.render('registrationSucess')

    }catch(error){
        console.log(error.message)
    }
}


const newInsertUser = async(req,res,next)=>{
    const spass = await securePassword(req.session.password)
    try{
        // const existingUser = await User.findOne({ email: req.bod.email });

        // if (existingUser) {
        //     // If the email already exists, render an error message
        //     return res.render('registration', { emailexistmessage: "Email already exists. Choose a different email." });
        // }

      const user = new  User({
        name:req.session.name,
        email:req.session.email,
        mobile:req.session.mobile,
        password:spass
     
        });

        const userData = await user.save();

        if(userData){
            // sendVerifyMail(req.body.name,req.body.email,userData._id)
        console.log(userData)
            res.render('registrationSucess',{message : "Sucessfully Registered"});
        }else{
            res.render('registrationSucess',{message : "Registration failed."});

        }

    }catch(error){
        console.log(error.message)
    }
    next()
}




// // Create a Nodemailer transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'abhilsh.brototype@gmail.com',
//         pass: 'nfjy xgfz fyxo rimf',
//     },
// });



const loadRegister = async(req,res)=>{

    try{
        res.render('registration');
    }catch(error){
        console.log(error.message);
    }

}

const loadLogin = (req,res)=>{

    try{
        res.render('login')
    }catch(error){
        console.log(error.message)
    }
}

// // not needed in this program because there is another newInsert user
// const insertUser = async(req,res)=>{
//     const spass = await securePassword(req.body.password)
//     try{
//         const existingUser = await User.findOne({ email: req.body.email });

//         if (existingUser) {
//             // If the email already exists, render an error message
//             return res.render('registration', { emailexistmessage: "Email already exists. Choose a different email." });
//         }

//       const user = new  User({
//         name:req.body.name,
//         email:req.body.email,
//         mobile:req.body.mobile,
//         password:spass
     
//         });

//         const userData = await user.save();

//         if(userData){
//             sendVerifyMail(req.body.name,req.body.email,userData._id)

//             res.render('registration',{message : "Sucessfully Registered"});
//         }else{
//             res.render('registration',{message : "Registration failed."});

//         }

//     }catch(error){
//         console.log(error.message)
//     }
// }

const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email})
        console.log(userData)

        if(userData){
                if(userData.is_active){
                    const passwordMatch = await  bcrypt.compare(password,userData.password);
                    if(passwordMatch){
                        req.session.user_id = userData._id;
                        res.redirect('/home');
                    }else{
                        console.log(userData.password)
                        console.log(password)
                        res.render('login',{message:" password is incorrect"})
                    }
        
                }else{
                    res.render('login',{message:" User is not active"})
        
                }
        }else{
                res.render('login',{message:"Email and password is incorrect"})
            }
    
        }catch(error){
            console.log(error.message)
        }
    }

const loadHome = async(req,res)=>{

    try{
       const userData = await User.findById({_id:req.session.user_id})
        res.render('home',{User:userData});
    }catch(error){
        console.log(error.message)
    }
}



module.exports ={
    loadRegister,
    loadLogin,
    loadHome,
    verifyLogin,
    sendVerifyMail,
    loadOtp,
    verifyOTP,
    newInsertUser,
    loadotpRedirect ,
    loadRegsucess
    

}
