// categoryRoutes.ts
import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategorymostCliked,
} from '../controller/category'; // Import category controllers


const router = express.Router();


// POST /api/categories
router.route('/create').post(createCategory);

// GET /api/categories
router.route('/getcategories').get(getAllCategories);

// GET /api/categories/:categoryId
router.route('/getcategorybyid/:categoryId').get(getCategoryById);

// PUT /api/categories/:categoryId
router.route('/updatecategorybyid/:categoryId').put(updateCategory);

// DELETE /api/categories/:categoryId
router.route('/deletecategorybyid/:categoryId').delete(deleteCategory);
router.route('/get-category-most-cliked').get(getCategorymostCliked);
export default router;
