import bcyrpt from "bcryptjs"

import User from "../models/user.model.js";
import { generateToken, getRandomInt } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is required" });
  }
  const { fullName, email, password } = req.body; 
  try {

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required"})
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email});
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcyrpt.genSalt(10);
    const hashedPassword = await bcyrpt.hash(password, salt);

    const username = fullName.toLowerCase().replace(/ /g, "_") + getRandomInt();

    const newUser = new User({
      fullName: fullName,
      email: email,
      username: username,
      password: hashedPassword
    })

    if (newUser){
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        username: newUser.username,
        profilePic: newUser.profilePic,
      })
    }
    else {
      return res.status(400).json({ message: "User creation failed" });
    }
  } catch (error) {
    console.log("Erorr in singup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  
  if (!req.body) {
    return res.status(400).json({ message: "Request body is required" });
  }
  const { email, password } = req.body
  try {
    const user = await User.findOne({email});

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials"});
    }

    const isPasswordCorrect = await bcyrpt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res)

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    })

  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge: 0})
    res.status(200).json({ message: "Logged out successfully" });
    
  } catch (error) {
    
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId, {
      profilePic: uploadResponse.secure_url
    }, { new: true }); 

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const checkAuth = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}