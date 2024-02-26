const express = require('express');
const { createProduct ,getProduct} = require('../controller/product');
const router = express.Router();

router.route('/createcategory').post(createProduct);
router.route('/getcategory').get(getProduct);
router.route('/getsinglecategory:id').get(getProduct);
router.route('/updatecategory:id').get(getProduct);
router.route('/deletecategory:id').get(getProduct);
   
module.exports = router; 