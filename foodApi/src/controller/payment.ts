import User from "../model/user.model";
import Payment from "../model/payment.model";
import { Request, Response } from 'express';
// Get All Payments
export const getAllPayments = async (req: Request, res: Response) => {
  console.log("payment reachout")
    try {
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
      
      const payments = await Payment.find(filter)
        // .populate('user')
        .populate('order')
        .skip(skip)
        .limit(pageSize)
        .sort(sortQuery);
        const count = await Payment.countDocuments(filter);

        // Calculate the total number of pages
        const totalPages = Math.ceil(count / pageSize);
        const paymentWithUserDetails = await Promise.all(payments.map(async (pay) => {
          const user = await User.findOne({telegramid:pay.telegramid});
          return { ...pay.toObject(), user };
      }));
      res.status(200).json({
        success: true,
        payments:paymentWithUserDetails,
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
  // Update Payment Details
export const updatePaymentDetails = async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.paymentId;
      const updatedDetails = req.body;
  
      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        updatedDetails,
        { new: true, runValidators: true }
      );
  
      if (!updatedPayment) {
        return res.status(404).json({ success: false, message: 'Payment not found!' });
      }
  
      res.status(200).json({
        success: true,
        payment: updatedPayment,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// Delete Payment
export const deletePayment = async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.paymentId;
  
      const deletedPayment = await Payment.findByIdAndDelete(paymentId);
  
      if (!deletedPayment) {
        return res.status(404).json({ success: false, message: 'Payment not found!' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully.',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// Get Pending Payments
export const getPendingPayments = async (req: Request, res: Response) => {
    try {
      const pendingPayments = await Payment.find({ status: 'Pending' })
        .populate('user')
        .populate('order')
        .sort('-createdAt') // Sort by creation date in descending order
        .exec();
  
      res.status(200).json({
        success: true,
        pendingPayments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// Get Successful Payments
export const getSuccessfulPayments = async (req: Request, res: Response) => {
    try {
      const successfulPayments = await Payment.find({ status: 'Success' })
        .populate('user')
        .populate('order')
        .sort('-createdAt') // Sort by creation date in descending order
        .exec();
  
      res.status(200).json({
        success: true,
        successfulPayments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// Get Failed Payments
export const getFailedPayments = async (req: Request, res: Response) => {
    try {
      const failedPayments = await Payment.find({ status: 'Failed' })
        .populate('user')
        .populate('order')
        .sort('-createdAt') // Sort by creation date in descending order
        .exec();
  
      res.status(200).json({
        success: true,
        failedPayments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// Get Payments by User and Status
export const getUserPaymentsByStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const status = req.params.status;
  
      const userPayments = await Payment.find({ user: userId, status })
        .populate('order')
        .sort('-createdAt') // Sort by creation date in descending order
        .exec();
  
      res.status(200).json({
        success: true,
        userPayments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// Get Payments within Date Range
export const getPaymentsWithinDateRange = async (req: Request, res: Response) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
  
      const payments = await Payment.find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .populate('user')
        .populate('order')
        .sort('-createdAt') // Sort by creation date in descending order
        .exec();
  
      res.status(200).json({
        success: true,
        payments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
              