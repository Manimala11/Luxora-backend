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

    price: {
      type: Number,
      required: true
    },

    stock: {
      type: Number,
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

    sizeStock: [
      {
        size: {type: String},
        stock: {type: Number, default: 0}
      }
    ],

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
