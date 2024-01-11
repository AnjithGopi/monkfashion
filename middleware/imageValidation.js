const imageSize = require('image-size');


// Middleware function to check if the uploaded files are images
const checkImageUpload = (req, res, next) => {

  const files = req.files['image'];

  if (!files) {
    req.flash('error','Image Format not supported')
    res.redirect('/admin/products')
    return 
  }

  // Check if each uploaded file is an image
  for (const file of files) {
    const dimensions = imageSize(file.buffer);

    if (!dimensions.width || !dimensions.height) {
        req.flash('error','Image Format not supported')
        res.redirect('/admin/products')
        return 
    }
  }

  next();
};

module.exports = {
    checkImageUpload
}