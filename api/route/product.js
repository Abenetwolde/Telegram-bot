const express = require('express');
const { createProduct ,getProduct,uploadimages,getSingleProdcut, searchProduct} = require('../controller/product');
const router = express.Router();

router.route('/createproduct').post(createProduct);
router.route('/getproducts').get(getProduct);
router.get("/getprodcut/:id", getSingleProdcut);
router.route('/search').get(searchProduct);
router.route('/uploadimages').post(uploadimages);
// router.route('/products/all').get(getProducts);
module.exports = router;