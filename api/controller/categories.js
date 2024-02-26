// const Product = require('../model/product');

const Category = require('../model/category');


// Create Product ---ADMIN
exports.createCategory = async (req, res) => {

    console.log("hit the create category api")
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
    })
    category = await category.save();
    if (!category)
        return res.status(400).send('the category cannot be created!')

    res.status(201).json({
        success: true,
        category
    });
};
exports.getCategorys = async (req, res) => {
    console.log("hit get all category api")
    try {


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
                sortQuery = { createdAt: -1 };
        }
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const skip = page * pageSize - pageSize;
        const categorys = await Category.find(filter).skip(skip).limit(pageSize).sort(sortQuery);
        const count = await Category.countDocuments(filter);
        const totalPages = Math.ceil(count / pageSize);
        res.json({
            categorys,
            count,
            page,
            pageSize,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSingleCategory = async (req, res) => {
    try {

        console.log("hit the getsingle category api")
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(500).json({ message: 'The category with the given ID was not found.' })
        }

        res.status(200).json({
            category
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateCategory = async (req, res) => {
    try {
        console.log("hit the update category api")
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
             ...req.body
            },
            { new: true }
        )/* .sort({ createdAt: -1 }) */

        if (!category)
            return res.status(400).send('the category cannot be created!')


        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCategory = async (req, res) => {
    console.log("hit delete category api")
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the category is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "category not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
};

