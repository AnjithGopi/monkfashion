// const sharp = require('sharp')




// async function resizeImage() {
//   try {
//     // await sharp("sammy.jpg")
//   const newi =   await sharp("sammy.jpg")
//       .resize({
//         width: 150,
//         height: 97
//       })
//    console.log(newi)
//   } catch (error) {
//     console.log(error);
//   }
// }

// resizeImage();







// var repeatedCharacter = function(s="abccabcdfr") {
//   s = s.split('')
//   s.forEach((ele,index)=>{
//       // console.log(index,ele)
//       newS=s.slice()
//       const cutArray = newS.splice(0,index)
//       const newSet =  new Set(cutArray)
//       if (newSet.has(ele)){
//           console.log("rrr")
//           return ele
//           // break
//       }
//       console.log(index,ele, "--",cutArray)
//   })
// //  for(let i = 1 ; i <s.length ; i++){
// //      for (let j=0;j<i;j++){
// //          if (s[i]==s[j]){
// //              return s[i]
// //          }
// //      }
// //  }

// };
// // var aaa
// aaa=repeatedCharacter
// console.log(aaa)