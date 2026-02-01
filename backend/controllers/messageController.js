import { Message } from "../models/messageModels.js";
import { Chat } from "../models/chatModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId, type = "text", poll } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "ChatId missing" });
    }

    if (type === "poll" && !poll?.question) {
      return res.status(400).json({ message: "Invalid poll data" });
    }

    let message = await Message.create({
      sender: req.user._id,
      content: content || "📊 Poll",
      chat: chatId,
      type,
      poll: type === "poll" ? poll : undefined,
    });

    message = await message.populate("sender", "name pic _id");
    message = await message.populate("chat");

    res.status(201).json(message);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json(err);
  }
};

export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic _id")
      .populate("chat");

    res.json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const editMessage = async (req, res) => {
  try {
    const { content } = req.body;

    let message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.content = content;
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("sender", "name pic _id")
      .populate("chat");

    req.io
      .to(updatedMessage.chat._id.toString())
      .emit("message-edited", updatedMessage);

    res.json(updatedMessage);
  } catch (err) {
    console.error("Edit message error:", err);
    res.status(500).json(err);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Message.deleteOne({ _id: message._id });

    req.io
      .to(message.chat.toString())
      .emit("messageDeleted", { messageId: message._id });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;

    const message = await Message.findById(req.params.messageId);
    if (!message || message.type !== "poll") {
      return res.status(404).json({ message: "Poll not found" });
    }

    message.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    });

    message.poll.options[optionIndex].votes.push(req.user._id);
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("sender", "name pic _id")
      .populate("chat");

    req.io
      .to(updatedMessage.chat._id.toString())
      .emit("poll-voted", updatedMessage);

    res.json(updatedMessage);
  } catch (err) {
    console.error("Poll vote error:", err);
    res.status(500).json(err);
  }
};
