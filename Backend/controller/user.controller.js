import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

export const getProfile=async(req,res)=>{
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(400).json({ error: "Username not found" });  
        }
        res.status(200).json({user});
    } catch (error) {
        console.log(`Error in the getprofile user controller ${error}`);
        res.status(500).json({error:"Internal server error"});
        
    }
}

export const followUnfollow=async(req,res)=>{
    try {
        const {id} = req.params;
        const currUser = await User.findOne({_id:req.user._id});
        const userToModify = await User.findOne({_id:id});

        if(!currUser || !userToModify){
            return res.status(400).json({error:"Username not found"});
        }

        if(id===req.user._id.toString()){
            return res.status(400).json({error:"You can't follow or unfollow"});
        }

        //This is to find whether the account is already following or not
        const isFollowing = currUser.following.includes(id);
        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate({_id:id},{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$pull:{following:id}})
            res.status(200).json({message:"Unfollow Successfull"})
        }
        else{
            //follow
            await User.findByIdAndUpdate({_id:id},{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$push:{following:id}})
            //Notification
            const newNotification = new Notification({
                type:"follow",
                from:req.user._id,
                to:userToModify._id
            })
            await newNotification.save();
            res.status(200).json({message:"follow Successfull"})
        }
        
    } catch (error) {
        console.log(`Error in the follower user controller ${error}`);
        res.status(500).json({error:"Internal server error"});
    }
}


export const getSuggestedUser=async(req,res)=>{
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({_id:userId}).select("-password");
        const users =  await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId}
                }
            },
            {
                $sample:{
                    size:10
                }
            }
        ]);

        const filterUser = users.filter((user)=>!userFollowedByMe.following.includes(user._id));
        const suggestedUser = filterUser.slice(0,4);
        suggestedUser.forEach((user)=>(user.password=null));
        res.status(200).json(suggestedUser);

    } catch (error) {
        console.log(`Error in the get suggestion user controller ${error}`);
        res.status(500).json({error:"Internal server error in getSuggestion"});
    }
}

export const updateUserData = async(req,res)=>{
    try {
        const userId = req.user._id;
        const {username,fullname,email,currpassword,newpassword,link,bio} = req.body;
        let {coverImage,profileImage} = req.body;

        let user = await User.findById(userId);
        if(!user){
            return res.status(400).json({error:"User not found"});
        }

        //To update password you need to know the curr password
        if((!newpassword && currpassword) || (newpassword && !currpassword)){
            return res.status(400).json({error:"Please provide new and curr password"});
        }

        if(newpassword && currpassword){
            const isMatch = await bcrypt.compare(currpassword,user.password);
            if(!isMatch){
                return res.status(400).json({error:"Current password is incorrect"});
            }
            if(newpassword<8){
                return res.status(400).json({error:"Min length is 8"});
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newpassword,salt);
            user.password = hashedPassword;
        }

        if(profileImage){
            if(user.profileImage){
                await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImage);
            profileImage = uploadedResponse.secure_url;
        }

        if(coverImage){
            if(user.coverImage){
                await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImage);
            coverImage = uploadedResponse.secure_url;
        }

        user.username = username || user.username;
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.link = link || user.link;
        user.bio = bio || user.bio; 
        user.profileImage = profileImage || user.profileImage;
        user.coverImage = coverImage || user.coverImage;

        user = await user.save();
        user.password = null;
        return res.status(200).json(user);

    } catch (error) {
        console.log(`Error in the get update user controller ${error}`);
        res.status(500).json({error:"Internal server error in userData"});
    }
}