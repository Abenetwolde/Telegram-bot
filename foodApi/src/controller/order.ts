// orderController.ts
import { Request, Response } from 'express';
import Order from '../model/order.model';
import Product from '../model/food.model';
import User from '../model/user.model';
import axios from 'axios';
import Payment from '../model/payment.model';
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
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = req.query.orderNumber ? req.query.orderNumber.toString() : '';
        const sortField = req.query.sortField ? req.query.sortField.toString() : 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const orderStatus = req.query.orderStatus ? req.query.orderStatus.toString() : '';
        const paymentType = req.query.paymentType ? req.query.paymentType.toString() : '';
        // const role = req.query.role ? req.query.role.toString() : '';
        let query: any = {};
        const searchNumber = parseInt(search, 10);
        if (!isNaN(searchNumber)) {
            query.orderNumber = searchNumber // Case-insensitive search
        }
        if (orderStatus) {
            query.orderStatus = orderStatus;
        }
        if (paymentType) {
            query.paymentType = paymentType;
        }

   
        // Build the sort object
        const sort: any = {};
        sort[sortField] = sortOrder;

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
        // const page = parseInt(req.query.page as string) || 1;
        // const pageSize = parseInt(req.query.pageSize as string) || 10; // Adjust the default page size as needed

        // Calculate the number of orders to skip
        const skip = (page - 1) * pageSize;

        // Find the orders for the current page
        const orders = await Order.find(query)
            .populate({
                path: 'orderItems.product',
                model: 'Product',
                select: 'name images price orderQuantity'
            })
            .populate('payment')
            .populate({
                path: 'user',
                select: 'username first_name'
            })
            .skip(skip)
            .limit(pageSize)
            .sort(sort);

        // Count the total number of orders
        const count = await Order.countDocuments(query);

        // Calculate the total number of pages
        const totalPages = Math.ceil(count / pageSize);


        // Fetch user details for each order
        const ordersWithUserDetails = await Promise.all(orders.map(async (order) => {
            const user = await User.findOne({ telegramid: order.telegramid });
            return { ...order.toObject(), user };
        }));
        res.status(200).json({
            success: true,
            orders: orders,
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

export const getOrdersPerDay = async (req: Request, res: Response) => {
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
        ]).sort({ _id: 1 });

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
        ]).sort({ _id: 1 });

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
        const user = await User.findOne({ telegramid: updatedOrder.telegramid });;

        if (user) {
            // If the user is found, send them a message on Telegram
            let message = '';
            const status = req.body.orderStatus
            const paymentstatus = req.body.paymentStatus
            console.log("req.bodyr", req.body)
            switch (status) {
                case "completed"
                    : message = '\n\nYour order has been completed.\n\nPlease check your profile for more details.'
                    break;
                case "delivered"
                    : message = '\n\nYour order has been delivered.\n\nPlease check your profile for more details.'
                    break;
                case "cancelled":
                    message = "\n\nSorry, Your order has been cancelled."
                    break;
                case "pending":
                    message = "\n\nSorry, Your order has been pending."
                    break;
                default: break;
            }
            if (req.body.paymentType == "Cash" && paymentstatus == "completed") {
                try {
                    console.log("this code is impelement", req.body.orderId)
                    const orderid = req.body.orderId
                    const ispaymentexist = await Payment.findOne({ order: orderid })
                    console.log("ordermpelement", ispaymentexist)
                    if (!ispaymentexist) {
                        const payment = new Payment({
                            telegramid: req.body.user._id,
                            total_amount: req.body.totalPrice,
                            paymentType: req.body.paymentType,
                            order: orderid
                        });
                        await payment.save();/*  */
                    }

                } catch (error) {
                    console.log(error)
                }
            }
            // const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${user.telegramid}&text=${encodeURIComponent(message)}`;
            const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${user.telegramid}&text=${encodeURIComponent(message)}`;

            // Send the HTTP request
            const response = await axios.post(url);

            if (response.status !== 200) {
                console.error('Failed to send message on Telegram:', response.data);
            }
        }
        const ordersWithUserDetails = await User.findOne({ telegramid: updatedOrder.telegramid });
        const updateorder = { ...updatedOrder.toObject(), user: ordersWithUserDetails };

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
export const getOrderbyCancelandComplated = async (req: Request, res: Response) => {
    interface OrderSummary {
        status: string;
        count: number;
        time: Date;
    }
    try {
        // Parse the start and end dates from the request query


        const { interval = 'perMonth' } = req.query;
        console.log(interval)
        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perWeek':
                // Calculate the start of the current week (Sunday)
                startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - startDate.getDay()); // Move to Sunday
                startDate.setUTCHours(0, 0, 0, 0);
                // Calculate the end of the current week (Saturday)
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6); // Move to Saturday
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perMonth':
                // Calculate the start and end of the current month
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perYear':
                // Calculate the start and end of the current year
                startDate = new Date(currentDate.getFullYear(), 0, 1);
                endDate = new Date(currentDate.getFullYear(), 11, 31);
                endDate.setUTCHours(23, 59, 59, 999);
                break;

        }
        let result: any[] = []
        let pipeline
        // Construct the aggregation pipeline

        // Execute the aggregation pipeline
        if (interval === "perWeek" || interval === "perMonth") {
            result = await Order.aggregate<OrderSummary>([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: { status: '$orderStatus', createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.createdAt',
                        orders: {
                            $push: {
                                status: '$_id.status',
                                count: '$count'
                            }
                        },
                        totalCount: { $sum: '$count' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        createdAt: '$_id',
                        orders: 1,
                        totalCount: 1
                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                }
            ]);

        } else if (interval == "perYear") {
            result = await Order.aggregate<OrderSummary>([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: { status: '$orderStatus', createdAt: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.createdAt',
                        orders: {
                            $push: {
                                status: '$_id.status',
                                count: '$count'
                            }
                        },
                        totalCount: { $sum: '$count' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        createdAt: '$_id',
                        orders: 1,
                        totalCount: 1
                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                }
            ]);
        }

        // Separate completed and cancelled orders
        const completedOrders = result.filter(item => item.status === 'completed');
        const cancelledOrders = result.filter(item => item.status === 'cancelled');

        // Send the summary as JSON response
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const getOrderbyCashandOnline = async (req: Request, res: Response) => {
    interface OrderSummary {
        status: string;
        count: number;
        time: Date;
    }
    try {
        // Parse the start and end dates from the request query


        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perWeek':
                // Calculate the start of the current week (Sunday)
                startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - startDate.getDay()); // Move to Sunday
                startDate.setUTCHours(0, 0, 0, 0);
                // Calculate the end of the current week (Saturday)
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6); // Move to Saturday
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perMonth':
                // Calculate the start and end of the current month
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perYear':
                // Calculate the start and end of the current year
                startDate = new Date(currentDate.getFullYear(), 0, 1);
                endDate = new Date(currentDate.getFullYear(), 11, 31);
                endDate.setUTCHours(23, 59, 59, 999);
                break;

        }
        let result: any[] = []
        let pipeline
        // Construct the aggregation pipeline

        // Execute the aggregation pipeline
        if (interval === "perWeek" || interval === "perMonth") {
            result = await Order.aggregate<OrderSummary>([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: { status: '$paymentType', createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.createdAt',
                        orders: {
                            $push: {
                                status: '$_id.status',
                                count: '$count'
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        createdAt: '$_id',
                        orders: 1
                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                }
            ]);

        } else if (interval == "perYear") {
            result = await Order.aggregate<OrderSummary>([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: { status: '$paymentType', createdAt: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.createdAt',
                        orders: {
                            $push: {
                                status: '$_id.status',
                                count: '$count'
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        createdAt: '$_id',
                        orders: 1
                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                }
            ]);
        }

        // Separate completed and cancelled orders
        const completedOrders = result.filter(item => item.status === 'completed');
        const cancelledOrders = result.filter(item => item.status === 'cancelled');

        // Send the summary as JSON response
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOrderMostOrderProduct = async (req: Request, res: Response) => {
    console.log("getOrderMostOrderProduct")
    interface OrderSummary {
        status: string;
        count: number;
        time: Date;
    }
    try {
        // Parse the start and end dates from the request query


        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perWeek':
                // Calculate the start of the current week (Sunday)
                startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - startDate.getDay()); // Move to Sunday
                startDate.setUTCHours(0, 0, 0, 0);
                // Calculate the end of the current week (Saturday)
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6); // Move to Saturday
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perMonth':
                // Calculate the start and end of the current month
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perYear':
                // Calculate the start and end of the current year
                startDate = new Date(currentDate.getFullYear(), 0, 1);
                endDate = new Date(currentDate.getFullYear(), 11, 31);
                endDate.setUTCHours(23, 59, 59, 999);
                break;

        }
        let result: any[] = []
        let pipeline
        // Construct the aggregation pipeline

        // Execute the aggregation pipeline
        if (interval === "perWeek" || interval === "perMonth") {
            result = await Order.aggregate<OrderSummary>([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                { $match: { orderStatus: { $in: ['completed', 'pending', 'delivered'] } } },
                {
                    $group: {
                        _id: '$orderItems.product',
                        productName: { $first: '$orderItems.product' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        _id: 0,
                        productName: '$product.name',
                        count: 1
                    }
                },
                // {
                //     $project: {
                //         _id: 0,
                //         productName: '$product.name',
                //         count: 1
                //     }
                // }
            ]);

        } else if (interval == "perYear") {
            result = await Order.aggregate<OrderSummary>([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                { $match: { orderStatus: { $in: ['completed', 'pending', 'delivered'] } } },
                {
                    $group: {
                        _id: '$orderItems.product',
                        productName: { $first: '$orderItems.product' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        _id: 0,
                        productName: '$product.name',
                        count: 1
                    }
                },

            ]);
        }

        // Separate completed and cancelled orders
        const completedOrders = result.filter(item => item.status === 'completed');
        const cancelledOrders = result.filter(item => item.status === 'cancelled');

        // Send the summary as JSON response
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const getOrderMostOrdeCategory = async (req: Request, res: Response) => {
    interface OrderSummary {
        status: string;
        count: number;
        time: Date;
    }
    console.log("getOrderMostOrdeCategory")
    try {
        // Parse the start and end dates from the request query


        const { interval = 'perMonth' } = req.query;

        // Get the current date
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Initialize start and end dates based on the selected interval
        let startDate, endDate;
        switch (interval) {
            case 'perDay':
                const selectedDate = new Date();
                startDate = new Date(selectedDate);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate = new Date(selectedDate);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perWeek':
                // Calculate the start of the current week (Sunday)
                startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - startDate.getDay()); // Move to Sunday
                startDate.setUTCHours(0, 0, 0, 0);
                // Calculate the end of the current week (Saturday)
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6); // Move to Saturday
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perMonth':
                // Calculate the start and end of the current month
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                endDate.setUTCHours(23, 59, 59, 999);
                break;
            case 'perYear':
                // Calculate the start and end of the current year
                startDate = new Date(currentDate.getFullYear(), 0, 1);
                endDate = new Date(currentDate.getFullYear(), 11, 31);
                endDate.setUTCHours(23, 59, 59, 999);
                break;

        }
        let result: any[] = []
        let pipeline
        // Construct the aggregation pipeline

        // Execute the aggregation pipeline

        result = await Order.aggregate<OrderSummary>([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            { $match: { orderStatus: { $in: ['completed', 'pending', 'delivered'] } } },
            {
                $group: {
                    _id: '$orderItems.product',
                    productName: { $first: '$orderItems.product' },
                    count: { $sum: 1 }
                }
            },

            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    _id: '$product.category',
                    count: 1,
                }
            },

            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },

            {
                $project: {
                    _id: 0,
                    categoryName: '$category.name',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            },


        ]);






        let aggregatedCounts: any = {};
        result.forEach((item) => {
            const { count, categoryName } = item;

            // If the category exists in the object, add the count
            if (aggregatedCounts[categoryName]) {
                aggregatedCounts[categoryName] += count;
            } else {
                // Otherwise, initialize the count
                aggregatedCounts[categoryName] = count;
            }
        })
        const dataArray = Object.entries(aggregatedCounts).map(([categoryName, count]) => ({ categoryName, count }));

        // Sort the array by count in ascending order
        dataArray.sort((a: any, b: any) => b.count - a.count);    // Send the summary as JSON response
        res.json({ categorycount: dataArray });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getTransactionDifferenceByMonth = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Calculate the start and end dates for the current month
        let startDate, endDate;
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        // Aggregate query to calculate total transactions per day for the current month
        const results = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }, // Filter based on the current month
                    orderStatus: { $ne: 'cancelled' } // Exclude cancelled orders
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalTransaction: { $sum: '$totalPrice' }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalTransaction: 1
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);


        const previousMonthResults = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate }, // Filter based on the previous month
                    orderStatus: { $ne: 'cancelled' } // Exclude cancelled orders
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalTransaction: { $sum: '$totalPrice' }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalTransaction: 1
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // Calculate percentage change and determine if it's an increase or decrease
        let percentageChange = 0;
        let increase = false;

        if (results.length > 0 && previousMonthResults.length > 0) {
            const currentMonthTotal = results.reduce((total, item) => total + item.totalTransaction, 0);
            const previousMonthTotal = previousMonthResults.reduce((total, item) => total + item.totalTransaction, 0);

            if (previousMonthTotal !== 0) {
                percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
                increase = currentMonthTotal > previousMonthTotal;
            }
        }

        // Send the response containing total transaction this month, percentage change, and increase boolean
        res.json({
            thisMonthData: results,
            totalTransactionThisMonth: results.reduce((total, item) => total + item.totalTransaction, 0),
            percentageChange,
            increase
        });

    } catch (error) {
        console.error('Error fetching transaction difference by month:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOrderCancelByMonth = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Calculate the start and end dates for the current month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        // Aggregate query to calculate total cancelled orders per day for the current month
        const results = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    orderStatus: 'cancelled'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        // Calculate the start and end dates for the previous month
        const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        previousMonthEndDate.setUTCHours(23, 59, 59, 999);

        // Aggregate query to calculate total cancelled orders per day for the previous month
        const previousMonthResults = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate },
                    orderStatus: 'cancelled'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        // Calculate percentage change and determine if it's an increase or decrease
        let percentageChange = 0;
        let increase = false;

        if (results.length > 0 && previousMonthResults.length > 0) {
            const currentMonthTotal = results.reduce((total, item) => total + item.count, 0);
            const previousMonthTotal = previousMonthResults.reduce((total, item) => total + item.count, 0);

            if (previousMonthTotal !== 0) {
                percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
                increase = currentMonthTotal > previousMonthTotal;
            }
        }

        // Send the response containing total cancelled orders this month, percentage change, and increase boolean
        res.json({
            thisMonthData: results,
            totalCancelledThisMonth: results.reduce((total, item) => total + item.count, 0),
            percentageChange,
            increase
        });

    } catch (error) {
        console.error('Error fetching cancelled orders by month:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOrderComplatedByMonth = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Calculate the start and end dates for the current month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        // Aggregate query to calculate total cancelled orders per day for the current month
        const results = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    orderStatus: { $in: ['completed', 'pending', 'delivered'] },
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        // Calculate the start and end dates for the previous month
        const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        previousMonthEndDate.setUTCHours(23, 59, 59, 999);

        // Aggregate query to calculate total cancelled orders per day for the previous month
        const previousMonthResults = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate },
                    orderStatus: { $in: ['completed', 'pending', 'delivered'] },
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        // Calculate percentage change and determine if it's an increase or decrease
        let percentageChange = 0;
        let increase = false;

        if (results.length > 0 && previousMonthResults.length > 0) {
            const currentMonthTotal = results.reduce((total, item) => total + item.count, 0);
            const previousMonthTotal = previousMonthResults.reduce((total, item) => total + item.count, 0);

            if (previousMonthTotal !== 0) {
                percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
                increase = currentMonthTotal > previousMonthTotal;
            }
        }

        // Send the response containing total cancelled orders this month, percentage change, and increase boolean
        res.json({
            thisMonthData: results,
            totalCancelledThisMonth: results.reduce((total, item) => total + item.count, 0),
            percentageChange,
            increase
        });

    } catch (error) {
        console.error('Error fetching cancelled orders by month:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getOrderByCash = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Calculate the start and end dates for the current month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        // Calculate the start and end dates for the previous month
        const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        previousMonthEndDate.setUTCHours(23, 59, 59, 999);
let results:any=[]
        // Aggregate query to calculate total orders by payment type for the current month
         results = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    paymentType: { $in: ['Cash'] },
                    orderStatus: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$totalPrice" },
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1,
                    totalPrice: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        // Aggregate query to calculate total orders by payment type for the previous month
        const previousMonthResults = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate },
                    paymentType: { $in: ['Cash'] },
                    orderStatus: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$totalPrice" },
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1,
                    totalPrice: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        let percentageChange = 0;
        let increase = false;

        if (results.length > 0 && previousMonthResults.length > 0) {
            const currentMonthTotal:any = results.reduce((total: any, item: { count: any; }) => total + item.count, 0);
            const previousMonthTotal = previousMonthResults.reduce((total, item) => total + item.count, 0);

            if (previousMonthTotal !== 0) {
                percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
                increase = currentMonthTotal > previousMonthTotal;
            }
        }

        res.json({
            currentMonthData:results,
            totalcash: results.reduce((total: any, item: { count: any; }) => total + item.count, 0),
            percentageChange,
            increase
        });

    } catch (error) {
        console.error('Error fetching orders by payment type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOrderByOnline = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        // Calculate the start and end dates for the current month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        // Calculate the start and end dates for the previous month
        const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        previousMonthEndDate.setUTCHours(23, 59, 59, 999);
let results:any=[]
        // Aggregate query to calculate total orders by payment type for the current month
         results = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    paymentType: { $in: ['online'] },
                    orderStatus: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$totalPrice" },
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1,
                    totalPrice: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        // Aggregate query to calculate total orders by payment type for the previous month
        const previousMonthResults = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate },
                    paymentType: { $in: ['online'] },
                    orderStatus: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$totalPrice" },
                }
            },
            {
                $project: {
                    _id: 0,
                    createdAt: '$_id',
                    count: 1,
                    totalPrice: 1
                }
            },
            {
                $sort: { createdAt: 1 }
            }
        ]);

        let percentageChange = 0;
        let increase = false;

        if (results.length > 0 && previousMonthResults.length > 0) {
            const currentMonthTotal:any = results.reduce((total: any, item: { count: any; }) => total + item.count, 0);
            const previousMonthTotal = previousMonthResults.reduce((total, item) => total + item.count, 0);

            if (previousMonthTotal !== 0) {
                percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
                increase = currentMonthTotal > previousMonthTotal;
            }
        }

        res.json({
            currentMonthData:results,
            totalcash: results.reduce((total: any, item: { count: any; }) => total + item.count, 0),
            percentageChange,
            increase
        });

    } catch (error) {
        console.error('Error fetching orders by payment type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};