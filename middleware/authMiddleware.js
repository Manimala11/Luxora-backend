const jwt = require("jsonwebtoken");
const auth = require('../models/auth.model')

const authMiddleware = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        return res.status(401).json({ message: "no token provided" })
    }
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "no token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await auth.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account is blocked. Contact admin." });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token" })
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "access denied. Admins only." })
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };