const sharp = require('sharp')




async function resizeImage() {
  try {
    // await sharp("sammy.jpg")
  const newi =   await sharp("sammy.jpg")
      .resize({
        width: 150,
        height: 97
      })
   console.log(newi)
  } catch (error) {
    console.log(error);
  }
}

resizeImage();