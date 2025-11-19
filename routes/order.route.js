const express = require('express');

const router = express.Router();
const { createOrder, getOrder, updateOrder, deleteOrder } = require('../controllers/order.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

router.post('/createOrder', authMiddleware, createOrder)

router.get('/getOrder', authMiddleware, getOrder)

// router.put('/updateOrder/:orderId', authMiddleware, updateOrder)

router.patch('/updateOrder/:orderId', authMiddleware, adminMiddleware, updateOrder)

router.delete('/deleteOrder/:orderId', authMiddleware, adminMiddleware, deleteOrder)

module.exports = router;