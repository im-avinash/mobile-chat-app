import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  deliveredAt: { type: Date },
  readAt: { type: Date }
}, { timestamps: true });


messageSchema.index({ conversation: 1, createdAt: 1 });


export default mongoose.model('Message', messageSchema);