import mongoose from 'mongoose';


const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: {
    type: String,
  },
  first_name: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  // Other feedback details...
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
