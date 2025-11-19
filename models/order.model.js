const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.ObjectId, ref: "auth", required: true },

        shippingInfo: {
            name: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true,
                match: /^\d{6}$/
            },
            phoneNo: {
                type: String,
                required: true,
                match: /^\d{10}$/
            },
            email: {
                type: String,
                required: true,
                match: /\S+@\S+\.\S+/
            }
        },

        orderItems: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Product",
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1
                },
                image: {
                    type: String,
                    required: true
                }

            }
        ],

        totalPrice: {
            type: Number,
            required: true,
            default: 0
        },

        orderStatus: {
            type: String,
            required: true,
            enum: ["Processing", "Cancelled", "Shipped", "Delivered"],
            default: "Processing",
        },

        paymentMethod: {
            type: String,
            required: true,
            enum: ["COD"],
            default: "COD"
        },

        paymentInfo: {
            type: String,
            required: true,
            default: "Processing",
            enum: ["Processing", "Cancelled", "Success"]
        },

        paidAt: {
            type: Date,
        },

        shippedAt: {
            type: Date
        },

        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },

        deliveredAt: {
            type: Date
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: "auth",
            required: false
        }
        
    }, {
    timestamps: true
}
);

orderSchema.pre("save", function (next) {
    this.totalPrice = this.orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    )
    next();
})

module.exports = mongoose.model("Order", orderSchema);