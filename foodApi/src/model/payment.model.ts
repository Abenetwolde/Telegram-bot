// paymentModel.js
import mongoose from 'mongoose';


const paymentSchema = new mongoose.Schema({
    telegramid: {
        type: Number,  // Use mongoose.Schema.Types.Number to specify a number type
        ref: "Users",
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
  // Other payment details...
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
