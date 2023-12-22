

function generateRefferalId(prefix = 'REF'){
  // Add a prefix to the referral ID (optional)
  let referralId = prefix;
  
  // Add a timestamp to ensure uniqueness
  referralId += new Date().getTime();

  // Add a random component to further ensure uniqueness
  referralId += Math.random().toString(36).substring(1,1);

  return referralId;
}


module.exports = {
    generateRefferalId
    
}