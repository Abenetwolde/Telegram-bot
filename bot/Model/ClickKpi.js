const mongoose = require('mongoose');
const Schema=require('mongoose');
const ClickKpi = new mongoose.Schema({
  telegramid: {
    type: Number,
    required: true,
    unique: true
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },

  clicks: [{
    name: {
      type: String,
      required: true
  },
    date: {
      type: Date,
      default: Date.now
    },
    count: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      required: true
  },

  }]
});

const clickKpi = mongoose.model('ClickKpi', ClickKpi);

module.exports = clickKpi;
