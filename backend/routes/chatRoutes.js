import express from 'express';
import { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup } from '../controllers/chatControllers.js';
import { protect } from '../middlewares/authmiddleware.js';
export const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);

router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

// module.exports = router;

// // TEMP FIX: remove wrong chatName from personal chats
// router.get("/fix-chatnames", async (req, res) => {
//   try {
//     const result = await Chat.updateMany(
//       { isGroupChat: false },
//       { $unset: { chatName: "" } }
//     );

//     res.json({
//       message: "Personal chat names fixed",
//       result,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json(err);
//   }
// });
