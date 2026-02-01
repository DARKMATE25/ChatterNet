import { generateToken } from "../config/generateTokens.js";
import { User } from "../models/userModel.js";
import bcrypt from 'bcryptjs'
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, pic } = req.body;

        if (!name || !email || !password) {
        return res.status(400).json({
            msg: "Please fill all required fields",
            isError: true,
        });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(200).json({ msg: "Email id already exist", isError: true })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        const nuser = {
            name,
            email,
            password: hashedPassword,
            pic,
        };
        const userSave = new User(nuser);
        await userSave.save();
        return res.status(200).json({
            _id: userSave._id,
            name: userSave.name,
            email: userSave.email,
            isAdmin: userSave.isAdmin,
            pic: userSave.pic,
            token: generateToken(userSave._id),
        });
    } catch (error) {
        console.error('Error while signing up:', error.message);
        return res.status(200).json({ msg: 'Error while Signup', isError: true });
    }

};
export const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ msg: "User not found", isError: true })
        }
        let match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(200).json({ msg: "Invalid Credentials", isError: true })
        }
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } catch (error) {
        return res.status(200).json({ msg: "Error while Login" ,isError:true})

    }




    // if (user && (await user.matchPassword(password))) {
    //     res.json({
    //         _id: user._id,
    //         name: user.name,
    //         email: user.email,
    //         isAdmin: user.isAdmin,
    //         pic: user.pic,
    //         token: generateToken(user._id),
    //     });
    // } else {
    //     res.status(401);
    //     throw new Error("Invalid Email or Password");
    // }
};


export const allUsers = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select("-password");
        // const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        return res.status(200).json({ data: users });

    } catch (error) {
        return res.status(200).json({ msg: "Error while Fetching All users Try again later..",isError:true })
    }


};