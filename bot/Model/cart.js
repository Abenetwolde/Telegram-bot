const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    // default: 1,
    validate: {
      validator: function(value) {
        // Ensure that quantity is less than 1
        return value >= 0;
      },
      message: 'Quantity must be less than 1',
    },
  
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: Number,
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
