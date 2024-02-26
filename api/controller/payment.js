const axios = require('axios'); 
const Product = require('../model/product');
const User=require('../model/user');
const Order = require('../model/order');

const Payment = require('../model/payment');
const mongoose = require('mongoose');

// Create Product ---ADMIN


exports.createPayment = async (req, res) => {

  console.log("hit the payment prodcut api")
  const userid=req.user._id
  console.log("userid from  middleware",userid)
  // Create a new Payment instance
  const newPayment = new Payment({
    user: userid,
    order: req.body.order,
    total_amount: req.body.total_amount,
    invoice_id: req.body.invoice_id,
    telegram_payment_charge_id: req.body.telegram_payment_charge_id,
    mobile: req.body.mobile,
  });

  try {
    // Save the new payment to the database
    const savedPayment = await newPayment.save();
    const updatedOrder = await Order.findByIdAndUpdate(
      req.body.order,
      {
        payment: savedPayment._id,
        paymentStatus: 'completed'
      },
      { new: true }  // This option returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const user = await User.findById(userid);

    if (user) {
      // If the user is found, send them a message on Telegram
      const message = 'Congratulations, you have successfully paid!';
      // const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${user.telegramid}&text=${encodeURIComponent(message)}`;
      const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=2126443079&text=${encodeURIComponent(message)}`;

      // Send the HTTP request
      const response = await axios.post(url);

      if (response.status !== 200) {
        console.error('Failed to send message on Telegram:', response.data);
      }
    }
    // Send the saved payment as a response
    return res.status(201).json({ "savedPayment": savedPayment, "updatedOrder": updatedOrder });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {  // Check if headers have already been sent
      return res.status(500).json({ message: 'Server error' });
    }
  }

}


