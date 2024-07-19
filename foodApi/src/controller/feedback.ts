import { Request, Response } from 'express';
 import Feedback from '../model/feedback.model';

 export const getAllFeedbacks = async (req:Request, res:Response) => {
  const { page = 1, limit = 10, search = '' }:any = req.query;
console.log(req.query)
  try {
    const matchQuery = search
      ? {
          $or: [
            { 'user.first_name': { $regex: search, $options: 'i' } },
            { 'user.username': { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const feedbacks = await Feedback.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: matchQuery },
      {  $sort:{
        createdAt:-1
      }},
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          feedback: 1,
          isRead: 1,
          isReply: 1,
          reply: 1,
          createdAt: 1,
          'user.first_name': 1,
          'user.username': 1,
        },
      },

    ]);

    const total = await Feedback.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: matchQuery },
      { $count: 'total' },
    ]);

    res.status(200).json({
      feedbacks,
      total: total[0] ? total[0].total : 0,
      page: Number(page),
      pages: Math.ceil((total[0] ? total[0].total : 0) / limit),
    });
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