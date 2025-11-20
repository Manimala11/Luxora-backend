const Order = require('../models/order.model')
const Product = require('../models/product.model')

const createOrder = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ success: false, message: "Admins cannot create orders" });
        }
        const { shippingInfo, orderItems } = req.body;
        if (!orderItems || !orderItems.length) {
            return res.status(400).json({ success: false, message: 'Order items cannot be empty' })
        }

        const detailedItems = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
            }


            // if (product.stock < item.quantity) {
            //     return res.status(400).json({
            //         success: false,
            //         message: `Insufficient stock for product: ${product.title}. Available: ${product.stock}`,
            //     })
            // }

            // product.stock -= item.quantity;

            if (item.selectedSize && product.sizeStock.length > 0) {
                const sizeObj = product.sizeStock.find(s => s.size === item.selectedSize);

                if (!sizeObj) {
                    return res.status(400).json({
                        success: false,
                        message: `Size ${item.selectedSize} not available for ${product.title}`
                    });
                }

                if (sizeObj.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${sizeObj.stock} left for size ${item.selectedSize} in ${product.title}`
                    });
                }
                sizeObj.stock -= item.quantity;
            }
            else {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${product.stock} left in stock for ${product.title}`
                    });
                }
                product.stock -= item.quantity;
            }
            await product.save({ validateBeforeSave: false });


            detailedItems.push({
                product: product._id,
                name: product.title,
                price: product.price,
                quantity: item.quantity,
                selectedSize: item.selectedSize || null,
                image: product.images?.[0] || ""
            })
        }

        const order = new Order({
            userId: req.user._id,
            shippingInfo,
            orderItems: detailedItems,
        })

        await order.save()

        res.status(201).json({ success: true, order })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getOrder = async (req, res) => {
    try {
        let orders;
        if (req.user.role === "admin") {
            orders = await Order.find()
                .populate("orderItems.product", "title price images createdBy")
                .populate("userId", "name email")
                .sort({ createdAt: -1 })
                .lean();
        }
        else {
            orders = await Order.find({ userId: req.user._id })
                .populate("orderItems.product", "title price images")
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 })
                .lean();
        }

        res.status(200).json({ success: true, orders })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const updateOrder = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Only admin can update orders" });
        }
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        if (!orderStatus) return res.status(400).json({ success: false, message: "No order status provided" });

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({ success: false, message: "Order not found" });
        }

        if (order.isDelivered) {
            return res.status(400).json({ success: false, message: "Delivered orders cannot be updated" });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "Shipped" && !order.shippedAt) {
            order.shippedAt = Date.now();
        }
        if (orderStatus === "Delivered") {
            order.deliveredAt = Date.now();
            order.isDelivered = true;
            order.paymentInfo = "Success"
        }
        if (orderStatus === "Cancelled") {
            order.shippedAt = null;
            order.deliveredAt = null;
            order.isDelivered = false;
            order.paymentInfo = "Cancelled";

            for (const item of order.orderItems) {
                const productId = item.product._id || item.product;
                const product = await Product.findById(productId);
                if (product) {
                    if (item.selectedSize && product.sizeStock.length > 0) {
                        const sizeObj = product.sizeStock.find(s => s.size === item.selectedSize);
                        if (sizeObj) sizeObj.stock += item.quantity;
                    } else {
                        product.stock += item.quantity;
                    }
                    await product.save({ validateBeforeSave: false });
                }
            }
        }
        await order.save()
        res.status(200).json({ success: true, message: "Order updated successfully", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Only admin can delete orders" });
        }
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }

        if (order.isDelivered) {
            return res.status(400).json({ success: false, message: "Delivered orders cannot be deleted" });
        }
        for (const item of order.orderItems) {
            const productId = item.product._id || item.product;
            const product = await Product.findById(productId);
            if (product) {
                if (item.selectedSize && product.sizeStock.length > 0) {
                    const sizeObj = product.sizeStock.find(s => s.size === item.selectedSize);
                    if (sizeObj) sizeObj.stock += item.quantity;
                } else {
                    product.stock += item.quantity;
                }

                await product.save({ validateBeforeSave: false });
            }
        }


        await order.deleteOne();
        res.status(200).json({ success: true, message: "order deleted successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
module.exports = { getOrder, createOrder, updateOrder, deleteOrder }