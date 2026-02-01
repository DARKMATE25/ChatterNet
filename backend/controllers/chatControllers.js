import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
export const accessChat = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).send({ message: "Userid not found", isError: true });
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            return res.status(200).json({ msg: "Some Error Ocuured", isError: true })
        }
    }
};


export const fetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                });
                return res.status(200).send(results);
            });

    } catch (error) {
        res.status(200).json({ msg: "Error Occured white loading chats", isError: true });
        // throw new Error(error.message);
    }
};


export const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(200).send({ message: "Please Fill all the feilds", isError: true });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(200).json({ msg: "More than 2 users are required to form a group chat", isError: true })
    }
    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        return res.status(200).send({ message: "Some Error Occured Please try again later", isError: true });
    }
};


export const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        return res.status(200).send({ message: "Group Not Found", isError: true });
    } else {
        res.json(updatedChat);
    }
};


export const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        return res.status(200).send({ message: "Unable to Add the user now", isError: true });
    } else {
        res.json(added);
    }
};



export const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;
console.log(chatId,userId);
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!removed) {
        return res.status(200).send({ message: "Error occured Try Again Later", isError: true });
    } else {
        res.json(removed);
    }
};