// paymentModel.js
import mongoose from 'mongoose';


const paymentSchema = new mongoose.Schema({
    telegramid: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
        // required: true
    }, 
order: {/*  */
    type: mongoose.Schema.ObjectId,
    ref: "Order",
    // required: true
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
    required: false
},
telegram_payment_charge_id: {
    type: String,
    required: false
},
paymentType: {
    type: String,
    enum: ['Cash', 'Online'],
  },
  createdAt: {
    type: Date,
    default: Date.now
},
  // Other payment details...
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
