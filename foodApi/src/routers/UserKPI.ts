// categoryRoutes.ts
import express from 'express';

import { GetUSerSpentTime, dateRangeSpentTime, getUsersJoinedByMethodPerTimeInterval, spendTimePerScene, totalNumberofClicks } from '../controller/UserKPI';


const router = express.Router();


// POST /api/categories
router.route('/get-user-spent-time').get(GetUSerSpentTime);
router.route('/get-user-spent-range').post(dateRangeSpentTime);
router.route('/get-user-spent-per-scene-name').get(spendTimePerScene);
router.route('/get-user-clicks').get(totalNumberofClicks);
router.route('/get-user-joined-by-method').get(getUsersJoinedByMethodPerTimeInterval);

// GET /api/categories


export default router;
