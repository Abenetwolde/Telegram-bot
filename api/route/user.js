const express = require('express');
const { createUser,getUserDetails,updateUserDetails ,adminLogin,deleteAuser,adminCreate,getAllAuser} = require('../controller/user');
const router = express.Router();

router.route('/createuser').post(createUser);
router.route('/adminlogin').post(adminLogin);
router.route('/admincreate').post(adminCreate);
 router.route('/getauser/:telegramid').get(getUserDetails);
 router.route('/updateuser/:telegramid').put(updateUserDetails);
  router.route('/deleteuser/:telegramid').delete(deleteAuser);
  router.route('/getallusers').get(getAllAuser);
module.exports = router;