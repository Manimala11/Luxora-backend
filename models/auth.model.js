const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    
    isBlocked: { 
        type: Boolean, 
        default: false 
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("auth", authSchema);