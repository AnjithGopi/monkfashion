// Mongo db Connection code

const dataBase = require('./config/mongo')
dataBase.dbConnect();
// const mongoose = require("mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/mongfashion");

// Express 
const express = require("express");
const app = express();

// Middlewares
const errorMiddleware = require('./middleware/errorMiddleware');

//other modules

const path = require('path')

// env
require("dotenv").config();
PORT = process.env.PORT


// No cache Module
const nocache=require('nocache')

app.use(nocache())

// Setting view engine as ejs

app.set('view engine','ejs');


app.use(express.urlencoded({extended:true}))
app. use(express.json());

// flash message
const flash = require('express-flash');
app.use(flash());

//for user router
const userRoute = require('./routes/userRoute')
app.use('/',userRoute);


//for admin router
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute);


//load static file
app.use('/static',express.static(path.join(__dirname,'public')) )



// Handling error
app.use('*', (req, res) => {
   res.render("pages/404")
  });
app.use(errorMiddleware);

app.listen(PORT,()=>{
    console.log(`Server Started on http://localhost:${process.env.PORT}`)
});


