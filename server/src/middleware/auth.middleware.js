import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        
        let token = req.cookies.jwt
        if (!token) {
            const authHeader = req.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Unauthorized - No token provided' });
              }

            token = authHeader.substring(7);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my-test-secret_key');
        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) { 
        console.error("Error in protectRoute middleware:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}