// categoryRoutes.ts
import express from 'express';

import { GetUSerSpentTime, dateRangeSpentTime } from '../controller/UserKPI';


const router = express.Router();


// POST /api/categories
router.route('/get-user-spent-time').get(GetUSerSpentTime);
router.route('/get-user-spent-range').post(dateRangeSpentTime);

// GET /api/categories


export default router;
