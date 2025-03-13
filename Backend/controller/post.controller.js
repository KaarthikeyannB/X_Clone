import Notification from "../model/notification.model.js";
import Post from "../model/post.model.js";
import User from "../model/user.model.js";
import cloudinary from "cloudinary";

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findOne({_id:userId});
		if (!user) return res.status(400).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You cannot delete the post : Unauthorised access" });
    }

    if (post.img) {
      const imgId = post.img.split(".").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(`Error in the delete post controller ${error}`);
    res.status(500).json({ error: "Internal server error in deletePost" });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res
        .status(404)
        .json({ error: "Text is required to post comment" });
    }

    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      text,
      user: userId,
    };

    post.comments.push(comment);
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.log(`Error in the comment post controller ${error}`);
    res.status(500).json({ error: "Internal server error in commentPost" });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLikedOrNotLiked = post.likes.includes(userId);

    if (isLikedOrNotLiked) {
      //Unlike
      await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPost: id } });

      const updatedLike = post.likes.filter((id)=>id.toString()!==userId.toString());
      res.status(200).json(updatedLike);
    } else {
      //Like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPost: id } });
      await post.save();
      //Send Notification

      const newNotification = new Notification({
        from: req.user._id,
        to: post.user,
        type: "like",
      });

      await newNotification.save();
      const updatedLike = post.likes;

      res.status(200).json(updatedLike);
    }
  } catch (error) {
    console.log(`Error in the like post  controller ${error}`);
    res.status(500).json({ error: "Internal server error in likePost" });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: [
          "-password",
          "-link",
          "-email",
          "-bio",
          "-following",
          "-followers",
        ],
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in the get all post controller ${error}`);
    res.status(500).json({ error: "Internal server error in getAllPost" });
  }
};

export const getAllLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isLikedPost = await Post.find({ _id: { $in: user.likedPost } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: [
          "-password",
          "-link",
          "-email",
          "-bio",
          "-following",
          "-followers",
        ],
      });
      return res.status(200).json(isLikedPost);
  } catch (error) {
    console.log(`Error in the get all  post controller ${error}`);
    res.status(500).json({ error: "Internal server error in getAllLikes" });
  }
};

export const getFollowers = async(req,res)=>{
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if(!user){
      return res.status(404).json({error:"UserName not found"});
    }

    const following = user.following;

    const feedPost = await Post.find({user:{$in:following}})
                      .sort({createdAt:-1})
                      .populate({
                        path:"user",
                        select:"-password"
                      })
                      .populate({
                        path:"comments.user",
                        select:"-password"
                      })
    
      res.status(200).json(feedPost);
  } catch (error) {
    console.log(`Error in the get followers  post controller ${error}`);
    res.status(500).json({ error: "Internal server error in getFollwers" });
  }
};

export const getPost = async(req,res)=>{
  try {
    const {username} = req.params;
    const user = await User.findOne({username});
    if(!user){
      return res.status(404).json({error:"Username not found"});
    }

    const post = await Post.find({user:user._id})
                  .sort({createdAt:-1})
                  .populate({
                    path:"user",
                    select:"-password"
                  })
                  .populate({
                    path:"comments.user",
                    select:"-password"
                  })
    res.status(200).json(post);
  } catch (error) {
    console.log(`Error in the get post in   post controller ${error}`);
    res.status(500).json({ error: "Internal server error in getpost" });
  }
};