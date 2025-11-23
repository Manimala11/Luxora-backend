const Product = require('../models/product.model');

const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category")
        if (categories.length === 0) return res.status(404).json({ message: "No categories found" });
        res.status(200).json({ categories })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getCategories }
