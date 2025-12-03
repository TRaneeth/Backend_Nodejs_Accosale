const Chat = require("../models/Chat");

// openChat, getMyChats, getMessages remain same as before (keep your working ones)

exports.openChat = async (req, res) => {
  try {
    const { otherUser } = req.body;
    const me = req.userId;

    let chat = await Chat.findOne({
      participants: { $all: [me, otherUser] }
    });

    if (!chat) {
      chat = await Chat.create({ participants: [me, otherUser], messages: [] });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create/open chat" });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    const me = req.userId;

    const chats = await Chat.find({ participants: me })
      .populate("participants", "username")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId).populate("messages.sender", "username");

    res.status(200).json(chat.messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const me = req.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const msg = { sender: me, text, readBy: [me], createdAt: new Date() }; // mark sender as read
    chat.messages.push(msg);
    chat.updatedAt = Date.now();
    await chat.save();

    const saved = chat.messages[chat.messages.length - 1];
    res.status(200).json(saved);
  } catch (err) {
    console.error("sendMessage err", err);
    res.status(500).json({ error: "Failed to send" });
  }
};

// NEW -> unread count for logged-in user (total unread messages across all chats)
exports.getUnreadCount = async (req, res) => {
  try {
    const me = req.userId;
    const chats = await Chat.find({ participants: me });

    let total = 0;
    for (const c of chats) {
      for (const m of c.messages) {
        // unread if sender != me AND me not in readBy
        const senderId = (m.sender && m.sender.toString) ? m.sender.toString() : String(m.sender);
        if (senderId !== String(me) && !(m.readBy || []).map(r => String(r)).includes(String(me))) {
          total++;
        }
      }
    }

    res.status(200).json({ unread: total });
  } catch (err) {
    console.error("getUnreadCount err", err);
    res.status(500).json({ error: "Failed" });
  }
};

// NEW -> mark all messages in chat as read by current user
exports.markChatRead = async (req, res) => {
  try {
    const me = req.userId;
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    let changed = false;
    for (let msg of chat.messages) {
      const already = (msg.readBy || []).map(r => String(r)).includes(String(me));
      if (!already) {
        msg.readBy = msg.readBy || [];
        msg.readBy.push(me);
        changed = true;
      }
    }
    if (changed) {
      chat.updatedAt = Date.now();
      await chat.save();
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("markChatRead err", err);
    res.status(500).json({ error: "Failed" });
  }
};
