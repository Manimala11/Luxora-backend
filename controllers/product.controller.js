const Product = require('../models/product.model');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const Order = require('../models/order.model')

const getProducts = async (req, res) => {
    try {

        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({ products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "no product found" });

        res.status(200).json({ product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const createProduct = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can create products" });
        }

        const { title, description, category, price, stock, tags, sizeStock } = req.body;
        if (!title || !description || !category || !price) {
            return res.status(400).json({ message: "all required fields must be provided" })
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }
        const imageUrls = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "uploads",
            });
            imageUrls.push(result.secure_url);
            fs.unlinkSync(file.path);
        }
        const parsedTags = tags ? JSON.parse(tags) : []
        let parsedSizeStock = [];
        if (sizeStock) {
            try {

                parsedSizeStock = JSON.parse(sizeStock);
            }
            catch (e) {
                return res.status(400).json({ message: "Invalid sizeStock format" });
            }
        }

        for (const item of parsedSizeStock) {
            if (!item.size || item.stock == null) {
                return res.status(400).json({ message: "Invalid size or stock value" });
            }
        }

        const finalStock = parsedSizeStock.length > 0 ? 0 : Number(stock) || 0;

        const product = await Product.create({
            title,
            description,
            category,
            price,
            images: imageUrls,
            tags: parsedTags,
            stock: finalStock,
            sizeStock: parsedSizeStock,
            createdBy: req.user._id,

        });
        res.status(201).json({ product });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const updateProduct = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can update products" });
        }
        const { id } = req.params;
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "product not found" })
        }


        const updateProduct = { ...req.body }

        if (updateProduct.sizeStock) {
            try {
                updateProduct.sizeStock = JSON.parse(updateProduct.sizeStock);
            } catch (err) {
                return res.status(400).json({ message: "Invalid sizeStock format" });
            }
        }
        if (updateProduct.stock !== undefined) {
            updateProduct.stock = Number(updateProduct.stock);
        }

        if (req.files && req.files.length > 0) {
            const imageUrls = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products"
                });
                imageUrls.push(result.secure_url);
                fs.unlinkSync(file.path);
            }
            updateProduct.images = imageUrls;
        }
        else {
            updateProduct.images = existingProduct.images;
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, updateProduct, { new: true, })
        res.status(200).json({ updatedProduct });
    } catch (err) {
        res.status(500).json({ error: err.message || err });
    }
}
const deleteProduct = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can update products" });
        }
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "product not found" })
        }

        await product.deleteOne();
        res.status(200).json({ message: "product deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const UpdateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating = 0, comment = "" } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const order = await Order.findOne({
            userId: req.user._id,
            "orderItems.product": id,
            isDelivered: true,
        });
        if (!order) {
            return res.status(403).json({
                success: false,
                message: "You can review only after delivery",
            });
        }
        const existingReview = product.reviews.find(
            (rev) => rev.userId.toString() === req.user._id.toString()
        )
        if (existingReview) {
            existingReview.rating = rating || existingReview.rating;
            existingReview.comment = comment || existingReview.comment;
        }
        else {
            product.reviews.push({
                userId: req.user._id,
                name: req.user.name,
                rating,
                comment
            });

            product.numOfReviews = product.reviews.length;
        }

        let totalRating = 0;
        product.reviews.forEach((rev) => {
            totalRating += rev.rating
        });

        product.rating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

        await product.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
            message: "Review submitted successfully",
            product,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, UpdateReview };