// POST /api/products
// Create a new product
import express, { Request, Response } from 'express';
import Product from '../model/food.model';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const cloudinary = require('cloudinary');
import mv from 'mv';
export const createProduct = async (req: Request, res: Response) => {
   console.log("create Prodcut")
    try {
      const { name, description, images, price, category, highlights, available, cookTime } = req.body;
 console.log("images,...", images)
const formattedImages = images.map((image: any) => ({
  imageId: image.imageId, // Assuming you have an imageId in the frontend
  imageUrl: image.imageUrl,
}));
console.log("images,...", formattedImages)

req.body.images = images;



      // Check if the product already exists
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(400).json({ success: false, message: 'Product already exists.' });
      }
  
      // Create a new product
      const newProduct = new Product(
      req.body,
)
  
      // Save the product to the database
      const savedProduct = await newProduct.save();
      await savedProduct.populate('category')

      res.status(201).json({
        success: true,
        product: savedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };

// Advanced product retrieval with filtering, sorting, pagination, and search
export const getProducts = async (req: Request, res: Response) => {
  console.log("getProduct")
    try {
      // Define the base filter
      let filter: any = {};
  
      // Apply category filter if provided in the query parameters
      if (typeof req.query.categories === 'string') {
        filter.category = { $in: req.query.categories.split(',') };
      } else if (Array.isArray(req.query.categories)) {
        // Handle the case when req.query.categories is an array
        filter.category = { $in: req.query.categories };
      }
  
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
      const products = await Product.find(filter)
        .populate('category')
        .skip(skip)
        .limit(pageSize)
        .sort(sortQuery);
  
      // Count the total number of products
      const count = await Product.countDocuments(filter);
  
      // Calculate the total number of pages
      const totalPages = Math.ceil(count / pageSize);
  
      res.status(200).json({
        success: true,
        products,
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

  export const uploadImageToCloudinary = async (req: Request, res: Response) => {
    console.log("Reached product upload");
    try {
      // Ensure that files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
  
      // Array to store uploaded images data
      const uploadedImages = [];
  
      // Loop through each file and upload to Cloudinary
      for (const file of req.files as Express.Multer.File[]) {
        const result = await cloudinary.uploader.upload(file.path);
        const imageUrl = result.secure_url;
        const imageId = result.public_id;
  
        // Push image data to the array
        uploadedImages.push({ imageUrl, imageId });
      }
  
      // Send the array of image data to the frontend
      res.json({imageUrl:uploadedImages});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
//   const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
//     cb(null, fileName);
//   },
// })
  export const ImageUpload = async (req: Request, res: Response) => {
    console.log("reach image uplload..........")
    try {
      // Access uploaded files information from req.files
      const files = req.files as Express.Multer.File[];
   
      // Generate file URLs and save files to the 'uploads' folder
      const fileUrls = files.map((file) => {
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        const filePath = path.join(__dirname, '../../uploads', fileName);
  
        // Save the file to the 'uploads' folder using mv
        mv(file.path, filePath, (err) => {
          if (err) {
            console.error('Error saving file:', err);
          }
        });
  
        // Return the file URL
        return `/${fileName}`;
      });
  
      res.json({ message: 'Images uploaded successfully!', fileUrls });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// GET /api/products/:productId
// Get a product by ID
export const getProductById = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
  
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
  
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// PUT /api/products/:productId
// Update a product by ID
export const updateProductById = async (req: Request, res: Response) => {
  console.log("update prodcut.....")
    try {
      const productId = req.params.productId;
      const { name, description, price, category, images, tags, cookTime } = req.body;
  
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
        ...req.body,
        },
        { new: true }
      ).populate('category');
  
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
  
      res.status(200).json({
        success: true,
        product: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
      
  // DELETE /api/products/:productId
// Delete a product by ID
export const deleteProductById = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
  
      const deletedProduct = await Product.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
  
      res.status(200).json({
        success: true,
        product: deletedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// GET /api/products/available
// Get available products
export const getAvailableProducts = async (req: Request, res: Response) => {
    try {
      const availableProducts = await Product.find({ available: true });
  
      res.status(200).json({
        success: true,
        products: availableProducts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// PUT /api/products/:productId/availability
// Update product availability by ID
export const updateProductAvailability = async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const { available } = req.body;
  
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { available },
        { new: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
  
      res.status(200).json({
        success: true,
        product: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// GET /api/products/price?min=100&max=500
// Get products within a price range
export const getProductsByPriceRange = async (req: Request, res: Response) => {
    try {
      const minPrice = req.query.min as string;
      const maxPrice = req.query.max as string;
  
      const productsInPriceRange = await Product.find({
        price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
      });
  
      res.status(200).json({
        success: true,
        products: productsInPriceRange,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
  // GET /api/products/cook-time?max=30
// Get products with cook time less than the specified value
export const getProductsByCookTime = async (req: Request, res: Response) => {
    try {
      const maxCookTime = req.query.max as string;
  
      const productsWithShortCookTime = await Product.find({
        cookTime: { $lt: maxCookTime },
      });
  
      res.status(200).json({
        success: true,
        products: productsWithShortCookTime,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// GET /api/products/popular
// Get popular products based on order quantity
export const getPopularProducts = async (req: Request, res: Response) => {
    try {
      const popularProducts = await Product.find().sort({ orderQuantity: -1 }).limit(10);
  
      res.status(200).json({
        success: true,
        products: popularProducts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// GET /api/products/availability/:available/category/:categoryId
// Get products based on availability and category
export const getProductsByAvailabilityAndCategory = async (req: Request, res: Response) => {
    try {
      const { available, categoryId } = req.params;
  
      const productsFiltered = await Product.find({ available: available === 'true', category: categoryId });
  
      res.status(200).json({
        success: true,
        products: productsFiltered,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
// GET /api/products/expiring-soon
// Get products with promotions expiring soon
export const getProductsExpiringSoon = async (req: Request, res: Response) => {
    try {
      const productsExpiringSoon = await Product.aggregate([
        {
          $lookup: {
            from: 'promotions', // Assuming the promotions collection name is 'promotions'
            localField: '_id',
            foreignField: 'product',
            as: 'promotions',
          },
        },
        {
          $match: {
            'promotions.endDate': { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Within the next 7 days
          },
        },
      ]);
  
      res.status(200).json({
        success: true,
        products: productsExpiringSoon,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error!' });
    }
  };
        
        