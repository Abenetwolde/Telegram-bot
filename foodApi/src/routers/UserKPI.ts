// categoryRoutes.ts
import express from 'express';

import { GetUSerSpentTime } from '../controller/UserKPI';


const router = express.Router();


// POST /api/categories
router.route('/get-user-spent-time').get(GetUSerSpentTime);

// GET /api/categories


export default router;
