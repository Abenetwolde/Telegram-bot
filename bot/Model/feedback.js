const mongoose = require('mongoose');

const FeedBackSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feedback: {
    type: String,
    required: true,
  },
  isRead:{
    type:Boolean,
    default:false
  },
  createdAt: { type: Date, default: Date.now },

   
})
module.exports = mongoose.model('FeedBack', FeedBackSchema);