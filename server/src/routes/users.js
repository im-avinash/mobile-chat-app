import { Router } from 'express';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';


const router = Router();


// All users except self, with last message preview
router.get('/', async (req, res) => {
  const me = req.user.id;
  const users = await User.find({ _id: { $ne: me } }).select('_id name email');


  // Latest message per conversation
  const convos = await Conversation.find({ members: me }).lean();
  const convoMap = new Map(convos.map(c => [c.members.find(m => String(m) !== String(me)), c]));


  res.json(users.map(u => {
    const c = convoMap.get(String(u._id));
    return {
      id: u._id,
      name: u.name,
      email: u.email,
      lastMessageText: c?.lastMessageText || '',
      lastMessageAt: c?.lastMessageAt || null
    };
  }));
});


// Messages with a peer
router.get('/with/:peerId/messages', async (req, res) => {
  const me = req.user.id;
  const { peerId } = req.params;
  const convo = await Conversation.findOne({ members: { $all: [me, peerId] } });
  if (!convo) return res.json([]);

  const messages = await Message.find({ conversation: convo._id })
    .sort({ createdAt: 1 });
  
  // Mark messages sent to me as delivered upon loading
  await Message.updateMany(
    { conversation: convo._id, to: me, deliveredAt: null },
    { $set: { deliveredAt: new Date() } }
  );

  res.json(messages.map(m => ({
    id: m._id,
    from: m.from,
    to: m.to,
    text: m.text,
    createdAt: m.createdAt,
    deliveredAt: m.deliveredAt,
    readAt: m.readAt
  })));
});


export default router;