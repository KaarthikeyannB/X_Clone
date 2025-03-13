import mongoose from "mongoose";

//This is a schema to create a new post but can be done when user logged in

const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
    }
    ,
    text:{
        type:String,
        require:true
    },
    img:{
        type:String
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    comments:[
        {
            text:{
                type:String,
                require:true
            },
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                require:true
            }
        }
    ]
},{timestamps:true});

const Post = mongoose.model("Post",postSchema);
export default Post;