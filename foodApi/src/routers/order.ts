// orderRoutes.ts
import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  getOrdersByStatus,
  getOrdersByUser,
  getOrdersByDateRange,
  getPaginatedOrders,
  getOrdersByTotalAmountRange,
  getOrderCount,
  getOrdersPerDay,
  getCancelledOrdersPerDay,
  getOrderFoodPerDay
} from '../controller/order'; // Import order controllers
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// POST /api/orders
router.route('/create').post(createOrder);

// GET /api/orders
router.route('/getorders').get(getOrders);
router.route('/getordersperday').get(getOrdersPerDay);
router.route('/cancelled-orders-per-day').get(getCancelledOrdersPerDay);
router.route('/high-order-food').get(getOrderFoodPerDay);
// GET /api/orders/:orderId
router.route('/getorderbyid/:orderId').get(getOrderById);

// PUT /api/orders/:orderId
router.route('/updateorderbyid/:orderId').put(updateOrderById);

// DELETE /api/orders/:orderId
router.route('/deleteorderbyid/:orderId').delete(deleteOrderById);

// GET /api/orders/status/:status
router.route('/getordersbystatus/:status').get(getOrdersByStatus);

// GET /api/orders/user/:userId
router.route('/getordersbyuser/:userId').get(getOrdersByUser);

// GET /api/orders/date-range
router.route('/getordersbydaterange').get(getOrdersByDateRange);

// GET /api/orders/paginated
router.route('/getpaginatedorders').get(getPaginatedOrders);

// GET /api/orders/total-amount-range
router.route('/getordersbytotalamountrange').get(getOrdersByTotalAmountRange);

// GET /api/orders/count
router.route('/getordercount').get(getOrderCount);

export default router;
