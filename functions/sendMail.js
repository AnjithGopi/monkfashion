const { trusted } = require('mongoose');
const OTP = require('./generateOTP')
const nodemailer = require('nodemailer');


async function sendEmailOtp(req){
    
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD,

    },
});

const otp = OTP.generateOTP();

req.session.otp = otp
req.session.save()
console.log("sendmail - generatd-otp:",otp)
console.log("session otp:",req.session.otp)
const mailOptions = {
    from: 'abhilash.brototype@gmail.com',
    to: req.session.email,
    subject: 'Verification Mail',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">Verification Code</h2>
            <p>Dear User,</p>
            <p>Your verification code is: <strong style="font-size: 1.2em; color: #28a745;">${otp}</strong></p>
            <p>Please use this code to complete the verification process.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <p>Best regards,<br> Mong Fashion's Team</p>
        </div>
    `,
};

// Use Promise style for sending mail
const info = await transporter.sendMail(mailOptions);
if (info.accepted.length > 0) {
    console.log('Message sent: %s', info.messageId);
    return true
}else{
    console.log("Otp failed to send")
    return false
}
}

module.exports = {
    sendEmailOtp
}