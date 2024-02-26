const Product = require('../model/product');

const Order = require('../model/order');
const mongoose = require('mongoose');

// Create Product ---ADMIN


exports.createOrder = async (req, res) => {

 console.log("hit the order prodcut api")

 const { shippingInfo, orderItems, user, totalPrice, orderStatus } = req.body;

 // Create a new Order instance
 const newOrder = new Order(
    req.body
 );

 try {
   // Save the new order to the database
   const savedOrder = await newOrder.save();

   // Send the saved order as a response
   res.status(201).json({
    success:"true",
    order:savedOrder});
 } catch (err) {
   // Send an error response if something goes wrong
   res.status(500).json({ message: err.message });
 }
  
}
exports.getorders = async (req, res) => {
    console.log("hit get orders api")
    try {
      const orders = await Order.find()
        .populate('user')
        .populate('payment')
        .populate({
          path: 'orderItems.product',
          populate: {
            path: 'category',
            model: 'Category'  // replace with your actual Category model name
          }
        });
  
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  exports.getauserorders = async (req, res) => {
    console.log("hit get get auserorders api")
    try {
        const orders = await Order.find({ user: req.params.userId, paymentStatus: 'pending' })
            .populate('user')
            .populate('payment')
            .populate({
                path: 'orderItems.product',
                populate: {
                    path: 'category',
                    model: 'Category'
                }
            });

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
  };
  exports.getacomplatedorders = async (req, res) => {
    console.log("hit getacomplatedorders api")
    try {
        const orders = await Order.find({ paymentStatus: 'completed', orderStatus: 'completed' })
            .populate('user')
            .populate('payment')
            .populate({
                path: 'orderItems.product',
                populate: {
                    path: 'category',
                    model: 'Category'
                }
            });

        res.json({ "orders": orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
  };
// exports.createProduct = async (req, res) => {
//     const product = await Product.create(req.body);

//     res.status(201).json({
//         success: true,
//         product
//     }); 
// };

