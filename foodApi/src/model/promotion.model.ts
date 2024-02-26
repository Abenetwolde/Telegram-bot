// promotionModel.js
import mongoose from 'mongoose';
 

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true, min: 0 },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  // Other promotion details...
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
