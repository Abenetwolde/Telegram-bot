
import express from 'express';
import { countUnreadFeedbacks, deleteFeedback, replyTheFeedback, updateIsRead } from '../controller/feedback';
import { getAllFeedbacks } from '../controller/feedback';
const router = express.Router();
router.get('/feedbacks', getAllFeedbacks);
router.put('/feedbacks/:id/isRead', updateIsRead);
router.get('/feedbacks/unread/count', countUnreadFeedbacks);
router.delete('/feedbacks/:id', deleteFeedback); 
router.post('/feedbacks/reply/:id', replyTheFeedback); 
export default router;

