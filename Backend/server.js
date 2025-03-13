// const express = require('express');
import express from "express";
import dotenv from "dotenv";
import authRoute from "../Backend/routes/auth.route.js";
import userRoute from "../Backend/routes/user.route.js";
import postRoute from "../Backend/routes/post.route.js";
import notificationRoute from "../Backend/routes/notification.route.js";
import connectDb from "./db/connectDb.js";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import cors from "cors";
import path from "path";

dotenv.config();
const PORT = process.env.PORT;

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_API_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET_KEY
})

const app = express();
const __dirname = path.resolve();

app.use(express.json(
    {
        limit:"7mb"
    }
));
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true    
}))

app.use(cookieParser());
app.use(express.urlencoded({
    extended:true
}))

app.use('/api/auth',authRoute);
app.use('/api/users',userRoute);
app.use('/api/post',postRoute);
app.use("/api/notification",notificationRoute);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontendx/dist")))
    app.use("*", (req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontendx","dist","index.html"))
    })
}

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDb();
})