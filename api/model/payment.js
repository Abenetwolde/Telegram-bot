const mongoose = require("mongoose");
const Schema = mongoose.Schema
const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
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
}, { timestamps: true });

module.exports = mongoose.model("payment", paymentSchema);