const Cart = require("../Model/cart");
const Order=  require("../Model/order") ;
async function calculateTotalPrice(cartItems) {
  let totalPrice = 0;
  for (const cartItem of cartItems.items) {
    const product = cartItem.product;
    const quantity = cartItem.quantity;
    totalPrice += product.price * quantity;
  }
  return totalPrice;
}
exports.createOrder = async (userid, userId, orderInformation, cartItems) => {
  try {
    // Validate order information
    if (!userId || !orderInformation  || !cartItems || !cartItems.items || cartItems.items.length === 0) {
      throw new Error('Incomplete order information.');
    }

    const totalPrice = await calculateTotalPrice(cartItems);
    let randomNumber = Math.floor(Math.random() * 90000) + 10000;

    // Create a new order document in the database without population
    const order = await Order.create({
      user:userid,
      orderNumber: randomNumber,
      telegramid: userId,
      orderItems: cartItems.items.map(cartItem => ({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
      })),
      totalPrice:totalPrice*100,
      paymentType: orderInformation?.paymentType||null,
      orderfromtelegram: true,
      shippingInfo: {
        location: orderInformation.location||null,
        note: orderInformation.note||null,
        phoneNo: orderInformation.phoneNo||null
      }
    });

    // Populate the orderItems.product field after creating the order
    const populatedOrder = await Order.findById(order._id).populate('orderItems.product').exec();

    // Clear the user's cart after creating the order
    await Cart.findOneAndDelete({ user: userId });

    return populatedOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order.');
  }
};

exports.getAllOrder=async()=> {
  try {
    const order = await Order.find({}).populate({
      path: 'orderItems.product',
      model: 'Product'
  })

  .limit(30)
  .sort({ createdAt: -1 });

    if (order) {
   
      return { success: true, orders: order };
    } else {
      return { success: false, message: 'Order is not found' };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
exports.getUserOrders = async (userId,status) => {
  try {
    const orders = await Order.find({ telegramid: userId ,orderStatus:status})
      .populate({
        path: 'orderItems.product',
        populate: {
          path: 'category',
          model: 'Category', // replace with your actual Category model name
        },
      });
    return  JSON.parse(JSON.stringify(orders))
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders.');
  }
};

exports.getOrderById= async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('orderItems.product');

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    return order;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw new Error('Failed to fetch order by ID.');
  }
};

//unused
exports.updateOrder = async (data) => {
  try {
    const order = await Order.findById(data.orderId).populate('orderItems.product');

    if (!order) {
      throw new Error('Order not found.');
    }

    order.shippingInfo.phoneNo = data?.phoneNo||null;
    order.paymentStatus=data?.paymentStatus||null
    order.orderStatus=data?.orderStatus||null
    await order.save();

    return JSON.parse(JSON.stringify(order)) ;
  } catch (error) {
    console.error('Error updating order quantity:', error);
    throw new Error('Failed to update order quantity.');
  }
};
exports.updateOrderStatus = async (orderId, newStatus) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: newStatus },
      { new: true }
    ).populate('orderItems.product');

    return updatedOrder.toObject();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status.');
  }
};
exports.updateOrderQuantity = async (orderId, productIndex, newQuantity) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found.');
    }

    const orderItem = order.orderItems[productIndex];

    if (!orderItem) {
      throw new Error('Product not found in the order.');
    }

    // Update the quantity and recalculate total price
    orderItem.quantity = newQuantity;
    order.totalPrice = calculateTotalPrice(order.orderItems);

    await order.save();

    return order;
  } catch (error) {
    console.error('Error updating order quantity:', error);
    throw new Error('Failed to update order quantity.');
  }
};

exports.cancelOrder = async (orderId, userId) => {
  try {
    // Check if the order belongs to the user
    const order = await Order.findOne({ _id: orderId, telegramid: userId });

    if (!order) {
        return { success: false, message: "Order not found or doesn't belong to the user." };
    }

    // Remove the order
    // await Order.findByIdAndRemove(orderId);
 await Order.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'cancelled' });

    return { success: true, message: "Order canceled successfully." };
} catch (error) {
    console.error("Error canceling order:", error);
    throw new Error("Failed to cancel the order.");
}
};

