import express from 'express';

const { createUser, getUserDetails,
    updateUserDetails, adminLogin,
    deleteAuser, adminCreate, getAllAuser,
    AddsFavorite,RemovesFavorite,NewuserDaily,
} = require('../controller/user');
const router = express.Router();

router.route('/createuser').post(createUser);
router.route('/adminlogin').post(adminLogin);
router.route('/admincreate').post(adminCreate);
router.route('/getauser/:telegramid').get(getUserDetails);
router.route('/getnewuser').get(NewuserDaily);
router.route('/updateuser/:telegramid').put(updateUserDetails);
router.route('/deleteuser/:telegramid').delete(deleteAuser);
router.route('/getallusers').get(getAllAuser);
router.route('/:id/favorites').post(AddsFavorite);
router.route('/api/users/:id/favorites/:productId').delete(RemovesFavorite);

export default router;