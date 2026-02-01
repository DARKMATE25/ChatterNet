import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  question: String,
  options: [
    {
      text: String,
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }
  ],
  anonymous: Boolean,
  multipleChoice: Boolean,
  expiresAt: Date,
  allowVoteChange: Boolean,
  pinned: Boolean,
});

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    content: String,

    type: {
      type: String,
      enum: ["text", "poll"],
      default: "text",
    },

    poll: pollSchema,
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export const Message = mongoose.model("Message", messageSchema);
