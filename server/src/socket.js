import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';

const onlineUsers = new Map();

export function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, { cors: { origin: corsOrigin, credentials: true } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      return next();
    } catch {
      return next(new Error('Bad token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    io.emit('presence:update', { userId: socket.userId, online: true });

    socket.on('typing:start', ({ to }) => {
      const toSock = onlineUsers.get(String(to));
      if (toSock) io.to(toSock).emit('typing:start', { from: socket.userId });
    });

    socket.on('typing:stop', ({ to }) => {
      const toSock = onlineUsers.get(String(to));
      if (toSock) io.to(toSock).emit('typing:stop', { from: socket.userId });
    });

    socket.on('message:send', async ({ to, text, clientId }) => {
      const me = socket.userId;
      if (!to || !text) return;
      let convo = await Conversation.findOne({ members: { $all: [me, to] } });
      if (!convo) convo = await Conversation.create({ members: [me, to] });

      const msg = await Message.create({
        conversation: convo._id,
        from: me,
        to,
        text
      });

      const toSock = onlineUsers.get(String(to));
      const deliveredAt = toSock ? new Date() : null;

      if (deliveredAt) {
        msg.deliveredAt = deliveredAt;
        await msg.save();
      }

      convo.lastMessageAt = new Date();
      convo.lastMessageText = text;
      await convo.save();

      const payload = { id: msg._id, from: me, to, text, createdAt: msg.createdAt, deliveredAt: msg.deliveredAt, clientId };

      // Emit to sender (confirm delivery)
      socket.emit('message:new', payload);

      // Emit to recipient if online
      if (toSock) {
        socket.to(toSock).emit('message:new', payload);
      }
    });

    socket.on('message:read', async ({ messageIds, peerId }) => {
      const me = socket.userId;
      if (!Array.isArray(messageIds) || !peerId) return;
      await Message.updateMany({ _id: { $in: messageIds }, to: me, from: peerId, readAt: { $exists: false } }, { $set: { readAt: new Date() } });

      const peerSock = onlineUsers.get(String(peerId));
      const ack = { messageIds, peerId: me };
      // Notify both sides
      io.to(socket.id).emit('message:read', ack);
      if (peerSock) io.to(peerSock).emit('message:read', ack);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      io.emit('presence:update', { userId: socket.userId, online: false });
    });
  });

  return io;
}