import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getPosts, getPostsByUser, sendPost } from "../controllers/post.controller.js";

const router = express.Router();


router.get("/users", protectRoute, getUsersForSidebar);
router.get("/user-posts", protectRoute, getPosts);
router.get("/posts", protectRoute, getPostsByUser);

router.post("/posts", protectRoute, sendPost);

export default router;