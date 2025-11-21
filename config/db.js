const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // serverSelectionTimeoutMS: 10000,
        })
        console.log("database connected successfully!");
    } catch (err) {
        console.log("connection failed: ", err)
    }
}

module.exports = connectDB;