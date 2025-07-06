import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import cloudinary from "../lib/cloudinary.js";



export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSideBar", error.message);
        res.status(500).json({ error: "Internal Server Error "});
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate('username', 'email');
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in getPosts controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getPostsByUser = async (req, res) => {
    try {
        const myId = req.user._id;

        const posts = await Post.find({_id: myId}).populate
        
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in getPostsByUser controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const sendPost = async (req, res) => {
    try {
        const { title, content, category, image } = req.body;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const validCategories = Post.schema.path('category').enumValues;
        if (!validCategories.includes(category)) {
            console.log({
                error: 'Invalid category',
                message: 'Assigning category type LIFESTYLE to post',
                validCategories: validCategories
            });
        }

        const newPost = new Post({
            title,
            content,
            category,
            author: senderId,
            image: imageUrl,
        });

        await newPost.save()


        res.status(201).json(newPost);

    } catch (error) {
        console.error("Error in sendPost controller", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};