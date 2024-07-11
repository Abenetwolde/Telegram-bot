import { Request, Response } from 'express';
 import Feedback from '../model/feedback.model';

export const getAllFeedbacks = async (req: Request, res: Response) => {
    try {
      const feedbacks = await Feedback.find().populate('user', 'first_name username');
      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Controller to update the isRead value of a feedback
  export const updateIsRead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const feedback = await Feedback.findById(id);
  
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
  
      feedback.isRead = true;
      await feedback.save();
  
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  export const replyTheFeedback = async (req: Request, res: Response) => {
    console.log("replyTheFeedback",req.body)
    console.log("replyTheFeedback",req.params)
    try {
      const { id } = req.params;
      const {reply}=req.body
      const feedback = await Feedback.findById(id).populate('user','telegramid');

      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
  
      feedback.isReply = true;
      feedback.isRead = true;
      feedback.reply = reply;
      await feedback.save();
  
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  export const countUnreadFeedbacks = async (req: Request, res: Response) => {
    try {
      const unreadCount = await Feedback.countDocuments({ isRead: false });
      res.status(200).json({ unreadCount });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  export const deleteFeedback = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const feedback = await Feedback.findByIdAndDelete(id);
  
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
  
      res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };