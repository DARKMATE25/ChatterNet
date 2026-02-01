import express from "express";
import { protect } from "../middlewares/authmiddleware.js";
import {
  sendMessage,
  allMessages,
  editMessage,
  deleteMessage,
} from "../controllers/messageController.js";
import { Message } from "../models/messageModels.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, allMessages);

router.put("/:messageId", protect, editMessage);
router.delete("/:messageId", protect, deleteMessage);

router.put("/pin/:messageId", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Unpin all other messages in this chat
    await Message.updateMany(
      { chat: message.chat },
      { isPinned: false }
    );

    // Toggle pin
    message.isPinned = !message.isPinned;
    await message.save();

    res.json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/vote/:messageId", protect, async (req, res) => {
  const { optionIndex } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(req.params.messageId);
  if (!message || message.type !== "poll")
    return res.status(404).json({ message: "Poll not found" });

  // Remove previous votes
  message.poll.options.forEach(opt => {
    opt.votes = opt.votes.filter(
      v => v.toString() !== userId.toString()
    );
  });

  // Add new vote
  message.poll.options[optionIndex].votes.push(userId);

  await message.save();
  res.json(message);
});


export default router;
