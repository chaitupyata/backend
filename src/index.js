// require('dotenv').config({path: './env'});

import dotenv from "dotenv";

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

import connectDB from "./db/index.js";


// b. DB Connection code ni Seperate file lo resi danni endhiloki inport chesi code ni exicute cheyyadam ;

// **  final ga "mongoose.connect()" ** 

dotenv.config({
  path: './env'
})

connectDB()











// Immediately Invoked Function Expression ( IFFE )

// a. index lo DB ni connect chesudu 

/*

import express from "express";

const app = express();


;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.listen("error", (error) => {
      console.log("ERRR:" , error);
      throw error
      
    })
    
    app.listen(process.env.PORT, () => {
      console.log(`App is listenig on port: ${process.env.PORT}`);
    
    })

  } catch (error) {
    console.error("ERRR: ", error);
    throw error
    
  }
})()

*/

