const mongoose = require('mongoose');

const KpiProduct = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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

const KpiProducts = mongoose.model('KpiProduct', KpiProduct);

module.exports = KpiProducts;
