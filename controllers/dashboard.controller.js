
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const getAdminDashboard = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const totalProducts = await Product.countDocuments();

        const orders = await Order.find()
            .populate('userId', "name email")
            .populate("orderItems.product", "title price")
            .sort({ createdAt: -1 });


        const totalOrders = orders.length;


        let totalRevenue = 0;
        orders.forEach(order => {
            if (order.paymentInfo === "Success") {
                order.orderItems.forEach(item => {
                    totalRevenue += item.price * item.quantity;
                });
            }
        });

        const recentOrders = orders
            .filter(order => order.orderStatus?.toLowerCase() !== 'delivered' && order.orderStatus?.toLowerCase() !== 'cancelled')
            .slice(0, 10)
            .map(order => ({
                _id: order._id,
                customerName: order.userId?.name || "Unknown",
                customerEmail: order.userId?.email || null,
                products: order.orderItems.map(item => item.product?.title),
                totalPrice: order.orderItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                ),
                orderStatus: order.orderStatus,
                createdAt: order.createdAt,
            }));

        res.json({
            success: true,
            totalProducts,
            totalOrders,
            totalRevenue,
            recentOrders,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { getAdminDashboard };
