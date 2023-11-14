const otpGenerator = require('otp-generator')

const generateOTP = () =>{
    const OTP = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    })
    return OTP
}

module.exports = { generateOTP }
// console.log(generateOTP())