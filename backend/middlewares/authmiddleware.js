import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const protect = async (req, res, next) => {
    // console.log("i am in protect");
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            return res.status(200).json({ msg: "Session Expired", isError: true })
        }
    }
    if (!token) {
        return res.status(200).json({ msg: "Session Expired", isError: true })
    }
};



