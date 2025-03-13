import generateToken from "../../utils/generateToken.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async(req,res)=>{
    if (!req.body.email || !req.body.username || !req.body.fullname || !req.body.password) {
        return res.status(400).json({ error: "All fields are required" }); // Handle missing fields
    }
    try {
        const {username,fullname,email,password} = req.body;

        //Checking a valid mail id
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Invalid Email Id"});
        }

        const existingMail = await User.findOne({email});
        const existingName = await User.findOne({username});

        if(existingMail || existingName){
            return res.status(400).json({error:"UserName or Email Already Taken"});
        }

        if(password.length<8){
            return res.status(400).json({error:"Minimum Password length is 8"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            username,
            fullname,
            email,
            password:hashedPassword
        })

        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            res.status(200).json({            
                _id:newUser.id,
                username:newUser.username,
                fullname:newUser.fullname,
                email:newUser.email,
                password:newUser.password
            });
        }
        else{
            res.status(400).json({error:"Invalid User Data"});
        }
        
    } catch (error) {
        console.log(`Error in signup controller ${error}`);
        res.status(500).json({error:"Internal Server Error"});
    }
}

export const login = async(req,res)=>{
    try {
        const {username,password} = req.body;
        const user = await User.findOne({username});
        const isPassCrct = await bcrypt.compare(password,user?.password || " ");
        if(!user || !isPassCrct){
            return res.status(400).json({error:"Ivalid password or username"});
        }
        else{
            generateToken(user._id,res);
            res.status(200).json({message:"Login In Successfull"});
        }
        
    } catch (error) {
        console.log(`Error in the Login controller ${error}`);
        res.status(500).json({error:"Internal Server Failed while login"})
    }
}

export const logOut = async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Log out successfull"});
    } catch (error) {
        console.log(`Error in the Logout controller ${error}`);
        res.status(500).json({error:"Internal Server Failed while loging out"})
    }
}

export const getMe=async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.user._id}).select("-password");
        res.status(200).json({user});
    } catch (error) {
        console.log(`Error in the getMe controller ${error}`);
        res.status(500).json({error:"Internal Server Failed while checking me"})
    }
}