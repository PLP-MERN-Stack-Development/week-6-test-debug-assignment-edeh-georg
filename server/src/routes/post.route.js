import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getPosts, getPostsByUser, sendPost, getPostsById, updateUserPost } from "../controllers/post.controller.js";

const router = express.Router();


router.get("/users", protectRoute, getUsersForSidebar);
router.get("/user-posts", protectRoute, getPosts);
router.get("/posts", protectRoute, getPostsByUser);
router.get("/posts/:id", protectRoute, getPostsById);

router.post("/posts", protectRoute, sendPost);

router.put("/posts/:id", protectRoute, updateUserPost);

export default router;