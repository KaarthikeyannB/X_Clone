import express from "express";
import protectRoute from "../../middleware/protectRoute.js";
import { createPost,deletePost,commentPost,likePost,getAllPost, getAllLikes,getFollowers, getPost} from "../controller/post.controller.js";

const router = express.Router();

router.post('/create',protectRoute,createPost);
router.delete('/:id',protectRoute,deletePost);
router.post('/comment/:id',protectRoute,commentPost);
router.post('/like/:id',protectRoute,likePost);
router.get('/likes/:id',protectRoute,getAllLikes);
router.get("/following",protectRoute,getFollowers);
router.get("/user/:username",protectRoute,getPost);

//Display all post
router.get('/all',protectRoute,getAllPost);

export default router; 