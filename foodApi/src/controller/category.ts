import { Request, Response } from 'express';
import Category from '../model/category.model';


export const createCategory = async (req: Request, res: Response) => {
  console.log("reach create caregory")
  try {
    const { name, icon } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    // Create a new category
    const newCategory = new Category({ name, icon });

    // Save the category to the database
    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      category: savedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error!' });
  }
};
export const getAllCategories = async (req: Request, res: Response) => {
  console.log("reach get caregory")
  try {
    // Define the base filter
    let filter: any = {};

 

    // Apply search filter if provided in the query parameters
    if (typeof req.query.search === 'string') {
      filter.name = { $regex: req.query.search, $options: 'i' };
    } 

    // Define the sorting criteria based on the 'sortBy' query parameter
    let sortQuery: any;
    switch (req.query.sortBy) {
      case 'latest':
        sortQuery = { createdAt: -1 };
        break;
      case 'popular':
        sortQuery = { countInStock: -1 };
        break;
      default:
        sortQuery = {};
    }

    // Parse the page and pageSize query parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10; // Adjust the default page size as needed/ Adjust the default page size as needed

    // Calculate the number of products to skip
    const skip = (page - 1) * pageSize;

    // Find the products for the current page
    const categorys = await Category.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sortQuery);

    // Count the total number of products
    const count = await Category.countDocuments(filter);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      success: true,
      categorys,
      count,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error!' });
  }
  };
  export const getCategoryById = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const category = await Category.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
  
      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
  export const updateCategory = async (req: Request, res: Response) => {
    console.log("hit the update category api")
    try {
      const { categoryId } = req.params;
    
  
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
       { ...req.body},
        { new: true } // Return the updated category
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
  
      res.status(200).json({
        success: true,
        category: updatedCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
  export const deleteCategory = async (req: Request, res: Response) => {
    console.log("hit delete category api")
    try {
      const { categoryId } = req.params;
  
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
  
      if (!deletedCategory) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
  
      res.status(200).json({
        success: true,
        category: deletedCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
        