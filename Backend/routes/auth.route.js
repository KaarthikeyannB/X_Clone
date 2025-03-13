import express from "express";
import { getMe, logOut, login, signUp } from "../controller/auth.controller.js";
import protectRoute from "../../middleware/protectRoute.js";


const router = express.Router();

router.post('/signup',signUp);
router.post('/login',login);
router.post('/logout',logOut);
router.get('/me',protectRoute,getMe);


export default router;