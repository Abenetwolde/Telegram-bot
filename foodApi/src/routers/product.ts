// productRoutes.js
import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getAvailableProducts,
  updateProductAvailability,
  getProductsByPriceRange,
  getProductsByCookTime,
  getPopularProducts,
  getProductsByAvailabilityAndCategory,
  getProductsExpiringSoon,
  ImageUpload,
  uploadImageToCloudinary
} from '../controller/product';


import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();
  
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });
// const upload = multer();
// POST /api/products 
router.route('/create').post(createProduct);
// router.route('/upload').post(upload.array('images', 5), ImageUpload);
router.route('/upload').post(upload.array('images', 5), uploadImageToCloudinary);
// GET /api/products
router.route('/getproducts').get(getProducts);
 
// GET /api/products/:productId
router.route('/getproductbybd/:productId').get(getProductById);

// PUT /api/products/:productId
router.route('/updateproductbyid/:productId').put(updateProductById);

// DELETE /api/products/:productId
router.route('/deleteproductbyid/:productId').delete(deleteProductById);

// GET /api/products/available
router.route('/available').get(getAvailableProducts);

// PUT /api/products/:productId/availability
router.route('/availability/:productId').put(updateProductAvailability);

// GET /api/products/price?min=100&max=500
router.route('/price').get(getProductsByPriceRange);

// GET /api/products/cook-time?max=30
router.route('/cook-time').get(getProductsByCookTime);

// GET /api/products/popular
router.route('/popular').get(getPopularProducts);

// GET /api/products/availability/:available/category/:categoryId
router.route('/availability/:available/category/:categoryId').get(getProductsByAvailabilityAndCategory);

// GET /api/products/expiring-soon
router.route('/expiring-soon').get(getProductsExpiringSoon);

export default router;
