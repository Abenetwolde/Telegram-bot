const mongoose = require('mongoose');

const KpiCategory = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  clicks: [{
    date: {
      type: Date,
      default: Date.now
    },
    count: { 
      type: Number,
      default: 0
    },
    userId: {
        type: String,
    }
  }]
});

const KpiCategorys = mongoose.model('KpiCategory', KpiCategory);

module.exports = KpiCategorys;
