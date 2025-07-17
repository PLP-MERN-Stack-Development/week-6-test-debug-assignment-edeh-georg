import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import cloudinary from "../lib/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";



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
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({ error: "Invalid page or limit values" });
        }

        const skip = (pageNum - 1) * limitNum;

        const posts = await Post.find({})
            .skip(skip)
            .limit(limitNum);
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


export const getPostsById = async (req, res) => {
    try {
        const postId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: 'Invalid post ID format' });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const data = {
            '_id': postId,
            'title': post.title
        };

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in getPostsById controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
  };

export const sendPost = async (req, res) => {
    try {
        const { title, content, category, image } = req.body;
        const senderId = req.user._id;

        if (!title || !content || !category){
            return res.status(400).json({error: "Missing parameters validation failed"});
        }

        const slug = title ? slugify(title, { lower: true }) : undefined;

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
            slug,
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


export const updateUserPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content, category, image } = req.body;
        if (!title && !content && !category && !image){
            return res.status(400).json({"error": "Update request must contain values to be updated"});
        }
        
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (existingPost.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
          }

        let imageUrl = existingPost.image;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const slug = title ? slugify(title, { lower: true }) : existingPost.slug;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                title: title || existingPost.title,
                content: content || existingPost.content,
                category: category || existingPost.category,
                image: imageUrl,
                slug: slug,
                updatedAt: new Date()
            },
            {
                new: true,
                runValidators: true 
            }
        );

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error("Error in updatePost controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }    
}

export const deleteUserPost = async (req, res) => {
    try {
        const postId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: 'Invalid post ID format' });
        }

        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (existingPost.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        if (existingPost.image) {
            try {
                const publicId = existingPost.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (imageError) {
                console.warn('Failed to delete image from cloudinary:', imageError);
            }
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            message: 'Post deleted successfully',
            deletedPostId: postId
        });

    } catch (error) {
        console.error("Error in deletePost controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
  };