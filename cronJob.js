// const schedule = require('node-schedule')


// const add = schedule.scheduleJob('*/2 * * * * *',()=>{
//     console.log("Job  .. ")
// })
// module.exports= {
//     add
// }

const order = require('./models/productModal')


async function  fun(){
   try {
    let data = await order.find().sort({selledQuantity:-1}).limit(3)
    console.log(data)
   } catch (error) {
    console.log(error.message)
    
   }
}
// db.students.aggregate([{ $group: { _id: "$location", countno: { $sum: 1 } } }])

fun()
  