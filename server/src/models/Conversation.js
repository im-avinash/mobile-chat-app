import mongoose from 'mongoose';


const conversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessageAt: { type: Date, default: Date.now },
  lastMessageText: { type: String }
}, { timestamps: true });


conversationSchema.index({ members: 1 }, { unique: false });


export default mongoose.model('Conversation', conversationSchema);