import mongoose from 'mongoose';


const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: String,
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  // Other subscription details...
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
