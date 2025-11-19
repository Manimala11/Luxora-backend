const express = require('express');
const upload = require('../middleware/multerMiddleware')
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, UpdateReview } = require('../controllers/product.controller');

const router = express.Router()

router.get('/admin', authMiddleware,adminMiddleware, getProducts)

router.get('/', getProducts);

router.get('/:id', getProduct);

router.post('/', authMiddleware, adminMiddleware, upload.array("images", 5), createProduct);

router.put('/:id',authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);

router.patch('/:id',authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);

router.delete('/:id',authMiddleware, adminMiddleware, deleteProduct);

router.patch('/:id/review', authMiddleware, UpdateReview);

module.exports = router;