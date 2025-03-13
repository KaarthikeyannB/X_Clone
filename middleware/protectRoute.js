import jwt from "jsonwebtoken";
import User from "../Backend/model/user.model.js";
const protectRoute=async(req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(500).json({error:"Unauthorised access in token"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(500).json({error:"Unauthorised access in decoded"});
        }

        const user = await User.findOne({_id:decoded.userId}).select("-password");
        if(!user){
            return res.status(500).json({error:"Username not found"});
        }
        req.user=user;
        next();

    } catch (error) {
        console.log(`Error in the protected middleware ${error}`);
        res.status(500).json({error:"Internal Server Failed while getting me"});
    }
}

export default protectRoute;