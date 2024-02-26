// paymentRoutes.ts
import express from 'express';
import {
  getAllPayments,
  updatePaymentDetails,
  deletePayment,
  getPendingPayments,
  getSuccessfulPayments,
  getFailedPayments,
  getUserPaymentsByStatus,
  getPaymentsWithinDateRange,
} from '../controller/payment'; // Import payment controllers

const router = express.Router();

// GET /api/payments
router.route('/getallpayments').get(getAllPayments);

// PUT /api/payments/:paymentId
router.route('/updatepaymentdetails/:paymentId').put(updatePaymentDetails);

// DELETE /api/payments/:paymentId
router.route('/deletepayment/:paymentId').delete(deletePayment);

// GET /api/payments/pending
router.route('/getpendingpayments').get(getPendingPayments);

// GET /api/payments/successful
router.route('/getsuccessfulpayments').get(getSuccessfulPayments);

// GET /api/payments/failed
router.route('/getfailedpayments').get(getFailedPayments);

// GET /api/payments/user/:userId/status/:status
router.route('/getuserpaymentsbystatus/:userId/:status').get(getUserPaymentsByStatus);

// GET /api/payments/date-range
router.route('/getpaymentswithindaterange').get(getPaymentsWithinDateRange);

export default router;
