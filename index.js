// Mongo db Connection code

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/mongfashion");

// Express 
const express = require("express");
const app = express();

//other modules

const path = require('path')

// No cache Module
const nocache=require('nocache')

app.use(nocache())

// Setting view engine as ejs

app.set('view engine','ejs');


app.use(express.urlencoded({extended:true}))
app. use(express.json());



//for user router
const userRoute = require('./routes/userRoute')
app.use('/',userRoute);


//for admin router
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute);


//load static file
app.use('/static',express.static(path.join(__dirname,'public')) )


app.get('*',(req,res)=>{
    res.status(404).send('404 - Not Found');
})

app.listen(8000,()=>{
    console.log("Server is running");
});

