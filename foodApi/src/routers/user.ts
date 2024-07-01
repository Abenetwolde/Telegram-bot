import express from 'express';
import { loginUser, refreshToken, registerUser } from '../controller/user';
import passport from 'passport';
import { isSuperAdmin } from '../Middelware/authMiddleware';
const { createUser, getUserDetails,
    updateUserDetails, adminLogin,
    deleteAuser, adminCreate, getAllAuser,
    AddsFavorite,RemovesFavorite,NewuserDaily,NewuserCustomRange,LanguagePreferance
} = require('../controller/user');
const router = express.Router();
router.post('/register', passport.authenticate('jwt', { session: false }), isSuperAdmin, registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);

router.route('/createuser').post(createUser);
router.route('/adminlogin').post(adminLogin);
router.route('/admincreate').post(adminCreate);
router.route('/getauser/:telegramid').get(getUserDetails);
router.route('/getnewuser').get(NewuserDaily);
router.route('/getuserrange').post(NewuserCustomRange);
router.route('/language-stats').get(LanguagePreferance);
router.route('/updateuser/:telegramid').put(updateUserDetails);
router.route('/deleteuser/:telegramid').delete(deleteAuser);
router.route('/getallusers').get(getAllAuser);
router.route('/:id/favorites').post(AddsFavorite);
router.route('/api/users/:id/favorites/:productId').delete(RemovesFavorite);
  
export default router;