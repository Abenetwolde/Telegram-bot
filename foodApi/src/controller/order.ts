// orderController.ts
import { Request, Response } from 'express';
import Order from '../model/order.model';
import Product from '../model/food.model';
import User from '../model/user.model';
import axios from 'axios';
const generateUniqueID = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { user, items, note, totalAmount, deliveryAddress, deliveryDate, status, payment } = req.body;

        const newOrder = new Order({
            user,
            items,
            note,
            totalAmount,
            deliveryAddress,
            deliveryDate,
            status,
            payment,
        });
        const uniqueID = generateUniqueID();
        // newOrder.orderId = uniqueID;
        const savedOrder = await newOrder.save();
        // Assuming payment is successful, update product count
        await Promise.all(
            items.map(async (item: any) => {
                const product = await Product.findById(item.product);

                if (product) {
                    product.orderQuantity += item.quantity;
                    await product.save();
                }
            })
        );

        // res.status(201).json({ success: true, order: savedOrder });
        res.status(201).json({ success: true, order: savedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    console.log("get all order")
    try {
        // Define the base filter
        let filter: any = {};

        // Apply search filter if provided in the query parameters
        if (typeof req.query.search === 'string') {
            filter.orderId = { $regex: req.query.search, $options: 'i' };
        }

        // Define the sorting criteria based on the 'sortBy' query parameter
        let sortQuery: any;
        switch (req.query.sortBy) {
            case 'latest':
                sortQuery = { createdAt: -1 };
                break;
            case 'oldest':
                sortQuery = { createdAt: 1 };
                break;
            default:
                sortQuery = {};
        }

        // Parse the page and pageSize query parameters
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10; // Adjust the default page size as needed

        // Calculate the number of orders to skip
        const skip = (page - 1) * pageSize;

        // Find the orders for the current page
        const orders = await Order.find(filter)
            .populate({
                path: 'orderItems.product',
                model: 'Product'
            })
            .populate('payment')
          
            .skip(skip)
            .limit(pageSize)
            .sort(sortQuery);

        // Count the total number of orders
        const count = await Order.countDocuments(filter);

        // Calculate the total number of pages
        const totalPages = Math.ceil(count / pageSize);
   
    
    // Fetch user details for each order
    const ordersWithUserDetails = await Promise.all(orders.map(async (order) => {
        const user = await User.findOne({telegramid:order.telegramid});
        return { ...order.toObject(), user };
    }));
        res.status(200).json({
            success: true,
            orders:ordersWithUserDetails,
            count,
            page,
            pageSize,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};
export const getOrdersPerDay = async(req: Request, res: Response) => {
    console.log("get all order per day")
    try {
      // Get the current date
      const currentDate = new Date();
  
      // Get the start of the current date (midnight)
      const startDate = new Date(currentDate.setHours(0, 0, 0, 0));
  
      // Get the end of the current date (11:59:59 PM)
      const endDate = new Date(currentDate.setHours(23, 59, 59, 999));
   console.log(`startdate{${startDate}} enddate  ${endDate}`)
      // Query the database to find all orders created between startDate and endDate
      const orderCounts = await Order.aggregate([
        // {
        //   $match: {
        //     createdAt: { $gte: startDate, $lte: endDate }
        //   }
        // },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]).sort({_id: 1});
  
      // Send the response containing the number of orders per day
      res.json(orderCounts);
    } catch (error) {
      // Handle errors
      console.error('Error fetching orders per day:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  export const getCancelledOrdersPerDay = async (req: Request, res: Response) => {
    try {
      // Get the current date
      const currentDate = new Date();
  
      // Get the start of the current date (midnight)
      const startDate = new Date(currentDate.setHours(0, 0, 0, 0));
  
      // Get the end of the current date (11:59:59 PM)
      const endDate = new Date(currentDate.setHours(23, 59, 59, 999));
  
      // Query the database to find all cancelled orders created between startDate and endDate
      const cancelledOrderCounts = await Order.aggregate([
        {
          $match: {
            // createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: 'cancelled' // Filter cancelled orders
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]).sort({_id: 1});
  
      // Send the response containing the number of cancelled orders per day
      res.json(cancelledOrderCounts);
    } catch (error) {
      // Handle errors
      console.error('Error fetching cancelled orders per day:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  export const getOrderFoodPerDay = async (req: Request, res: Response) => {
    console.log("reach getOrderFoodPerDay")
    try {
        // Aggregate orders by product ID and count the occurrences
        const aggregatedOrders = await Order.aggregate([
          {
            $unwind: '$orderItems', // Split array into separate documents
          },
          {
            $lookup: { // Join with the Product collection to get product details
              from: 'products',
              localField: 'orderItems.product',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: '$product', // Unwind the product array
          },
          {
            $group: { // Group by product name and count occurrences
              _id: '$product.name',
              count: { $sum: 1 },
            },
          },
        ]);
    
        res.json(aggregatedOrders);
      } catch (error) {
        console.error('Error aggregating orders:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
  };
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('user').populate('payment').exec();

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateOrderById = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.orderId;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            
            { ...req.body },
            { new: true }
        ).populate({
            path: 'orderItems.product',
            model: 'Product'
        })
            .populate('payment');

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const user = await User.findOne({telegramid:updatedOrder.telegramid});;

        if (user) {
          // If the user is found, send them a message on Telegram
          let message = '';
          const status=req.body.orderStatus
          switch(status){
           case "completed"
           :message = '\n\nYour order has been completed.\n\nPlease check your profile for more details.' 
           break;
           case "cancelled":
            message=  "\n\nSorry, Your order has been cancelled."
            break;
           default:break;
          }
          // const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${user.telegramid}&text=${encodeURIComponent(message)}`;
          const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${user.telegramid}&text=${encodeURIComponent(message)}`;
    
          // Send the HTTP request
          const response = await axios.post(url);
    
          if (response.status !== 200) {
            console.error('Failed to send message on Telegram:', response.data);
          }
        }
        const ordersWithUserDetails =await User.findOne({telegramid:updatedOrder.telegramid});
          const updateorder= { ...updatedOrder.toObject(),user: ordersWithUserDetails };
            
        res.status(200).json({ success: true, order: updateorder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteOrderById = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.orderId;
        const deletedOrder = await Order.findByIdAndDelete(orderId).populate('user').populate('payment').exec();

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, order: deletedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOrdersByStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;
        const orders = await Order.find({ status }).populate('user').populate('payment').exec();

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOrdersByUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ user: userId }).populate('user').populate('payment').exec();

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOrdersByDateRange = async (req: Request, res: Response) => {
    try {
        // const { startDate, endDate } = req.query;
        const startDateParam = req.query.startDate as string;
        const endDateParam = req.query.endDate as string;

        // Check if both startDateParam and endDateParam are valid dates
        const startDate = startDateParam ? new Date(startDateParam) : null;
        const endDate = endDateParam ? new Date(endDateParam) : null;

        // Check if the dates are valid before using them in the query
        const dateFilter: Record<string, any> = {};
        if (startDate && !isNaN(startDate.getTime())) {
            dateFilter.$gte = startDate;
        }

        if (endDate && !isNaN(endDate.getTime())) {
            dateFilter.$lte = endDate;
        }

        const orders = await Order.find({
            deliveryDate: dateFilter,
        }).populate('user').populate('payment').exec();

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getPaginatedOrders = async (req: Request, res: Response) => {
    try {
        const { page, pageSize } = req.query;
        const orders = await Order.find()
            .populate('user')
            .populate('payment')
            .skip(Number(page) * Number(pageSize))
            .limit(Number(pageSize))
            .exec();

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOrdersByTotalAmountRange = async (req: Request, res: Response) => {
    try {
        const { minTotalAmount, maxTotalAmount } = req.query;
        const orders = await Order.find({
            totalAmount: { $gte: Number(minTotalAmount), $lte: Number(maxTotalAmount) },
        }).populate('user').populate('payment').exec();

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOrderCount = async (req: Request, res: Response) => {
    try {
        const count = await Order.countDocuments();

        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
