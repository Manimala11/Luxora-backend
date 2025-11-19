const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoute = require("./routes/auth.route")
const productRoute = require("./routes/product.route")
const categoryRoute = require("./routes/category.route")
const orderRoute = require("./routes/order.route")
const dashboardRoute = require("./routes/dashboard.routes")
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

connectDB();

app.use('/api/auth', authRoute);

app.use('/api/product', productRoute);

app.use('/api/categories', categoryRoute);

app.use('/api/order', orderRoute)

app.use("/api/dashboard", dashboardRoute);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res)=>{
    res.send("success");
});

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`);
});