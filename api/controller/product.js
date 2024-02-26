const Product = require('../model/product');
const multer = require('multer');
const Category=require('../model/category');
const mongoose = require('mongoose');
const path = require('path');
const category = require('../model/category');
const cloudinary = require('cloudinary');
const product = require('../model/product');
// Create Product ---ADMIN
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads');
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + path.extname(file.originalname));
//     }
//   });
  

const  storage =  multer.diskStorage({
    destination: function async  (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: async function  (req, file, cb)  {
        const fileName =  file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
         cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});
// const upload = multer({ storage });
const uploadOptions = multer({ storage: storage });
exports.uploadimages = async (req, res) => {
    uploadOptions.array('images',10)(req, res, (err) => {
      if (err) { 
        res.status(500).json({
          success: false,
          message: err.message
        });
      } else {
        const imageLinks = req.files.map(file => `uploads/${file.filename}`);
        res.status(201).json({
          success: true,
          imageLinks
        });
      }
    });
}

exports.createProduct =   async (req, res) => {

    console.log("hit the create prodcut api")
    console.log("CATEGORY ID",req.body.category)
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');
    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLink.push({
            url: result.secure_url,
            publicId: result.public_id
        });
    }




    ;

console.log("imagesLink",imagesLink)
    let specs = [];
    req.body.specifications.forEach((s) => {
        specs.push(s)
    });
    req.body.specifications = specs;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        images: imagesLink, // "http://localhost:3000/public/upload/image-2323232"
        price: req.body.price,
        specifications:specs,
        category: req.body.category,
        warranty:1,
        countInStock: req.body.countInStock,

    });

    product = await product.save();

    if (!product) return res.status(500).send('The product cannot be created');
    res.status(201).json({
        success: true,
        product
    }); 
};
// exports.createProduct = async (req, res) => {
//     const product = await Product.create(req.body);

//     res.status(201).json({
//         success: true,
//         product
//     }); 
// };
exports.getProduct =async (req, res) => {
    try {

        console.log("hit the prodcut api")
        let filter = {};
        if (req.query.categories) {
            filter = { category: req.query.categories };
        }
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }
        const sortBy = req.query.sortBy;

        let sortQuery; 
        switch (sortBy) {
          case 'latest':
            sortQuery = { createdAt: -1 };
            break;
          case 'popular':
            sortQuery = { countInStock: -1 };
            break;
          default:
            sortQuery = {};
        }
        // if (req.query.search) {
        //     filter.$text = { $search: req.query.search };
        // }
    
    
        // Parse the page and pageSize query parameters
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 3;
        
        // Calculate the number of products to skip
        const skip = page * pageSize-pageSize;
        
        // Find the products for the current page
        const products = await Product.find(filter).populate("category").skip(skip).limit(pageSize).sort(sortQuery);
        
        // Count the total number of products
        // const total = await Product.countDocuments(filter);
         const count = await Product.countDocuments(filter);
         const totalPages = Math.ceil(count / pageSize);
        res.json({
            products,
            count,
            page,
            pageSize,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSingleProdcut =async (req, res) => {
    try {

        console.log("hit the getsingle product api")
        const product = await Product.findById(req.params.id);

        if(!product) {
            res.status(500).json({message: 'The category with the given ID was not found.'})
        } 
    
        res.status(200).json({
            product
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchProduct =async (req, res) => {
    try {
        const query = req.query.q;

        // Find products that match the search query
        const products = await Product.find({ $text: { $search: query } });
      
        // Return the search results
        res.json(products);
      
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// // Update Product ---ADMIN
// exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

//     let product = await Product.findById(req.params.id);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     if (req.body.images !== undefined) {
//         let images = [];
//         if (typeof req.body.images === "string") {
//             images.push(req.body.images);
//         } else {
//             images = req.body.images;
//         }
//         for (let i = 0; i < product.images.length; i++) {
//             await cloudinary.v2.uploader.destroy(product.images[i].public_id);
//         }

//         const imagesLink = [];

//         for (let i = 0; i < images.length; i++) {
//             const result = await cloudinary.v2.uploader.upload(images[i], {
//                 folder: "products",
//             });

//             imagesLink.push({
//                 public_id: result.public_id,
//                 url: result.secure_url,
//             });
//         }
//         req.body.images = imagesLink;
//     }

//     if (req.body.logo.length > 0) {
//         await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
//         const result = await cloudinary.v2.uploader.upload(req.body.logo, {
//             folder: "brands",
//         });
//         const brandLogo = {
//             public_id: result.public_id,
//             url: result.secure_url,
//         };

//         req.body.brand = {
//             name: req.body.brandname,
//             logo: brandLogo
//         }
//     }

//     let specs = [];
//     req.body.specifications.forEach((s) => {
//         specs.push(JSON.parse(s))
//     });
//     req.body.specifications = specs;
//     req.body.user = req.user.id;

//     product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(201).json({
//         success: true,
//         product
//     });
// });

// // Delete Product ---ADMIN
// exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.params.id);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     for (let i = 0; i < product.images.length; i++) {
//         await cloudinary.v2.uploader.destroy(product.images[i].public_id);
//     }

//     await product.remove();

//     res.status(201).json({
//         success: true
//     });
// });

// // Create OR Update Reviews
// exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

//     const { rating, comment, productId } = req.body;

//     const review = {
//         user: req.user._id,
//         name: req.user.name,
//         rating: Number(rating),
//         comment,
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

//     if (isReviewed) {

//         product.reviews.forEach((rev) => { 
//             if (rev.user.toString() === req.user._id.toString())
//                 (rev.rating = rating, rev.comment = comment);
//         });
//     } else {
//         product.reviews.push(review);
//         product.numOfReviews = product.reviews.length;
//     }

//     let avg = 0;

//     product.reviews.forEach((rev) => {
//         avg += rev.rating;
//     });

//     product.ratings = avg / product.reviews.length;

//     await product.save({ validateBeforeSave: false });

//     res.status(200).json({
//         success: true
//     });
// });

// // Get All Reviews of Product
// exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.query.id);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     res.status(200).json({
//         success: true,
//         reviews: product.reviews
//     });
// });

// // Delete Reveiws
// exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.query.productId);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

//     let avg = 0;

//     reviews.forEach((rev) => {
//         avg += rev.rating;
//     });

//     let ratings = 0;

//     if (reviews.length === 0) {
//         ratings = 0;
//     } else {
//         ratings = avg / reviews.length;
//     }

//     const numOfReviews = reviews.length;

//     await Product.findByIdAndUpdate(req.query.productId, {
//         reviews,
//         ratings: Number(ratings),
//         numOfReviews,
//     }, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(200).json({
//         success: true,
//     });
// });