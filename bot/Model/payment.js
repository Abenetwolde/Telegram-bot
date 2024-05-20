const mongoose = require("mongoose");
const Schema = mongoose.Schema
const paymentSchema = new mongoose.Schema({
    telegramid: {
        type: mongoose.Schema.ObjectId,
        ref: "Users",
        required: true
        // required: true
    }, 
    order: {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
        required: true
    },
    shippingCharge: {
        type: Number,
        required: false
    },
    total_amount: {
        type: Number,
    },
    invoice_id: {
        type: String,
        required: true
    },
    telegram_payment_charge_id: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['Cash', 'Online'],
      },
      createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);