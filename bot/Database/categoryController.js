const Category = require('../Model/category');

async function getAllCategories() {
  try {
 
    const categoriesData = await Category.find()
   
    return {
      categories: categoriesData,
    };
  } catch (error) {
    throw new Error('Error fetching categories from the database.');
  }
}

module.exports = {
  getAllCategories,
};
