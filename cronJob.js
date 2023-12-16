const schedule = require('node-schedule')


schedule.scheduleJob('*/2 * * * * *',()=>{
    console.log("Job  .. ")
})
