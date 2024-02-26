const express = require('express');
const { createCategory ,getCategorys,uploadimages,getSingleCategory,updateCategory,deleteCategory,} = require('../controller/categories');
const router = express.Router();

router.route('/createcategory').post(createCategory);
router.route('/getcategorys').get(getCategorys);
// router.route('/getsinglecategory/:id').get(getSingleCategory);
router.route('/updatecatagory/:id').put(updateCategory);
router.route('/deletecategory/:id').delete(deleteCategory);

router.get("/getsinglecategory/:id", getSingleCategory);
// router.get("/getcategorys", countByType);
// router.get("/room/:id", getHotelRooms);
// router.route('/products/all').get(getProducts);
module.exports = router;