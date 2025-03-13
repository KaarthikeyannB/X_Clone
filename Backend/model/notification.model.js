import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
    },
    type:{
        type:String,
        require:true,
        enum:["follow","like"]
    },
    read:{
        type:Boolean,
        default:false
    }    
},{timestamps:true});

const Notification = mongoose.model("Notification",notificationSchema);
export default Notification;