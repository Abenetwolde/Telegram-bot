const express = require('express');
const { validateToken,isSuperAdmin,isAdminORSuperAdmin,isYourAccount } = require("../middlewares/AuthMiddleWare");
const { createPayment} = require('../controller/payment');

const router = express.Router();

router.post('/createpayment',validateToken,/* isYourAccount, */createPayment);
// router.route('/getcategorys').get(getCategorys);

module.exports = router;