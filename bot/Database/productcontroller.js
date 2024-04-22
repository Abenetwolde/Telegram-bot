const Product = require('../Model/product');

async function getAllProducts(data) {
 try { 

    let filter = {};
    if (data?.category) {
        filter = { category: data.category };
    }
    if (data?.search) {
        filter.name = { $regex: data.search, $options: 'i' };
    }
    // const sortBy = data.sortBy||"latest";

    // let sortQuery; 
    // switch (sortBy) {
    //   case 'latest':
    //     sortQuery = { createdAt: -1 };
    //     break;
    //   case 'popular':
    //     sortQuery = { countInStock: -1 };
    //     break;
    //   default:
    //     sortQuery = {};
    // }
    // if (req.query.search) {
    //     filter.$text = { $search: req.query.search };
    // }


    // Parse the page and pageSize query parameters
    const page = parseInt(data?.page) || null;
   
    const pageSize = parseInt(data?.pageSize) || null;
    
    // Calculate the number of products to skip
    const skip = page * pageSize-pageSize;
    
    // Find the products for the current page
    const products = await Product.find(filter).populate("category").skip(skip).limit(pageSize)/* .sort(sortQuery); */
    

     const count = await Product.countDocuments(filter);
     const totalPages = Math.ceil(count / pageSize);
    return {
      products: products,
      count,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    throw new Error('Error fetching products from the database.');
  }
}
async function searchProducts(searchTerm) {

  try {
 
    // Construct the filter based on the search term
    const filter = { name: { $regex: searchTerm?.search, $options: 'i' } };



    // Find the products matching the search criteria for the current page
    const products = await Product.find(filter)
      .populate('category')


    return {
      products: products,

    };
  } catch (error) {
    console.log(error)
    throw new Error('Error fetching products from the database.',error);
  }
}

// Database file (e.g., database.js)
async function getSingleProduct(productId) {
    try {
      const product = await Product.findById(productId).populate('category');
      // Convert Mongoose document to plain JavaScript object
      return product ? product.toObject() : null;
    } catch (error) {
      throw new Error('Error fetching product from the database.');
    }
  } 
  
module.exports = {
  getAllProducts,
  getSingleProduct,
  searchProducts
};
