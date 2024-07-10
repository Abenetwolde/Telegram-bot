import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feedback: {
    type: String,
    required: true,
  },
  isRead:{
    type:Boolean,
    default:false
  },
  isReply:{
    type:Boolean,
    default:false
  },
  reply:{
    type: String,

  },
  createdAt: { type: Date, default: Date.now },
  // Other feedback details...
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;

