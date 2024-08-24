import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials:true
}))


// konni settings cheyali 

// DATA anedhi raka rakaluga vasthundhi kadha dhani gurichi preparation jaruguthundhi 

//     a.( URL nuchi, JSON lo , request BODY lo chestharu ante FORM SUBMIT chesinappudu , Form Json lo form vasthundhi )

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))


// CookieParser pani entidhi ???

// => Nenu Na Server nichi User yokka Browser lo vunna Cookies ni access cheyyadaniki , and Cookies ni set cheyadaniki 

// simply Browser lo vunna Cookies paina CURD Operation cheathandhuku ....

// ante Sercure Cookies ni pampisthavu avi Server thone READ, AND WRITE cheyyabadathaye

app.use(cookieParser())


export { app }











