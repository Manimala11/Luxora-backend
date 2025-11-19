const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    brand: {
      type: String
    },

    price: {
      type: Number,
      required: true
    },

    discount: {
      type: Number
    },

    stock: {
      type: Number,
      required: true,
      max: 9999,
      default: 1
    },

    numOfReviews: {
      type: Number,
      default: 0
    },

    images: [String],

    rating: {
      type: Number,
      default: 0
    },

    size: [String],

    tags: [String],

    reviews: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "auth"
        },
        name: {
          type: String,
          required: true
        },
        rating: {
          type: Number,
          default: 0
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
      },
    ],
    
    createdBy: { type: mongoose.Schema.ObjectId, ref: "auth", required: true }
  },
  { timestamps: true }
);



module.exports = mongoose.model("Product", productSchema);
