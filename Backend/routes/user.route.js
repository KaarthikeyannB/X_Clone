import express from 'express';
import protectRoute from "../../middleware/protectRoute.js";
import { followUnfollow, getProfile ,getSuggestedUser,updateUserData} from '../controller/user.controller.js';

const router = express.Router();

router.get('/profile/:username',getProfile);
router.post('/follow/:id',protectRoute,followUnfollow);
router.get('/suggested',protectRoute,getSuggestedUser);
router.post('/update',protectRoute,updateUserData);

export default router;