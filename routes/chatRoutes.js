const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const chat = require("../controllers/chatController");

router.post("/open", verifyToken, chat.openChat);
router.get("/mychats", verifyToken, chat.getMyChats);
router.get("/messages/:id", verifyToken, chat.getMessages);
router.post("/send", verifyToken, chat.sendMessage);

// new endpoints
router.get("/unread-count", verifyToken, chat.getUnreadCount);
router.post("/mark-read/:id", verifyToken, chat.markChatRead);

module.exports = router;
