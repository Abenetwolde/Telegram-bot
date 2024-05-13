// categoryRoutes.ts
import express from 'express';

import { GetTimeSpentPerScene, GetUSerSpentTime, dateRangeSpentTime, getUserTotalClicksPerName, getUsersJoinedByMethodPerTimeInterval, getUsersPerformance, spendTimePerScene, totalNumberofClicks,getUsersLotterandInvitedUserData } from '../controller/UserKPI';


const router = express.Router();


// POST /api/categories
router.route('/get-user-spent-time').get(GetUSerSpentTime);
router.route('/get-user-spent-range').post(dateRangeSpentTime);
router.route('/get-user-spent-per-scene-name').get(spendTimePerScene);
router.route('/get-user-clicks').get(totalNumberofClicks);
router.route('/get-user-joined-by-method').get(getUsersJoinedByMethodPerTimeInterval);
router.route('/get-user-time-spent-per-scene').get(GetTimeSpentPerScene);
router.route('/get-users-total-clicks-per-name').get(getUserTotalClicksPerName);
router.route('/get-users-performance').get(getUsersPerformance);
router.route('/get-users-with-lottery-numbers').get(getUsersLotterandInvitedUserData);
// GET /api/categories


export default router;
