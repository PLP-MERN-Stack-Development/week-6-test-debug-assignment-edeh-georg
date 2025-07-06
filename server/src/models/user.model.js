import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
            unique: false
        },
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 20,
            match: /^[a-zA-Z0-9_]+$/,
            trim: true
        },
        password: {
            type: String,
            required: true,
            unique: false,
            minlength: 6
        },
        profilePic: {
            type: String,
            required: false,
            default: "",
        },
    },
    {
        timestamps: true,
    }
)


const User = mongoose.model("User", userSchema);

export const _create = async (data) => {
    const document = new User(data);
    await document.validate();
    const savedDocument = await document.save();
    return savedDocument;
  };

export default User;