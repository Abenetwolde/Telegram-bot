const express = require('express');
const { createOrder,getorders,getauserorders,getacomplatedorders } = require('../controller/order');
const router = express.Router();

router.route('/createorder').post(createOrder);
router.route('/getorders').get(getorders);
router.route('/orders/:userId/pending').get(getauserorders);
router.route('/orders/completed').get(getacomplatedorders);
// router.route('/getcategorys').get(getCategorys);

module.exports = router;