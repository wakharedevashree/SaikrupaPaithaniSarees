




// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   orderNumber: {
//     type: String,
//     unique: true,
//     required: true,
//     default: function() {
//       return `SKP${Date.now()}${Math.floor(Math.random() * 1000)}`;
//     }
//   },
//   items: [{
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true
//     },
//     name: String,
//     price: Number,
//     quantity: Number,
//     image: String
//   }],
//   shippingAddress: {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     address: { type: String, required: true },
//     city: { type: String, required: true },
//     state: { type: String, required: true },
//     pincode: { type: String, required: true }
//   },
//   orderSummary: {
//     subtotal: { type: Number, required: true },
//     shipping: { type: Number, required: true },
//     tax: { type: Number, required: true },
//     discount: { type: Number, default: 0 },
//     total: { type: Number, required: true }
//   },
//   shippingMethod: {
//     type: String,
//     enum: ['standard', 'express', 'free'],
//     required: true
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['razorpay', 'cod', 'qr'],
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
//     default: 'pending'
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'completed', 'failed', 'refunded'],
//     default: 'pending'
//   },
//   razorpayOrderId: {
//     type: String
//   },
//   razorpayPaymentId: {
//     type: String
//   },
//   refundStatus: {
//     type: String,
//     enum: ['none', 'requested', 'processed', 'completed'],
//     default: 'none'
//   },
//   deliveryDate: {
//     type: Date,
//     default: null
//   },
//   expectedDelivery: {
//     type: Date,
//     default: function() {
//       const date = new Date();
//       if (this.shippingMethod === 'express') {
//         date.setDate(date.getDate() + 3);
//       } else if (this.shippingMethod === 'standard') {
//         date.setDate(date.getDate() + 7);
//       } else {
//         date.setDate(date.getDate() + 10);
//       }
//       return date;
//     }
//   }
// }, {
//   timestamps: true
// });

// orderSchema.index({ orderNumber: 1 }, { unique: true });

// export default mongoose.model("Order", orderSchema);









// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   orderNumber: {
//     type: String,
//     unique: true,
//     required: true,
//     default: function() {
//       return `SKP${Date.now()}${Math.floor(Math.random() * 1000)}`;
//     }
//   },
//   items: [{
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true
//     },
//     name: String,
//     price: Number,
//     quantity: Number,
//     image: String
//   }],
//   shippingAddress: {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     address: { type: String, required: true },
//     city: { type: String, required: true },
//     state: { type: String, required: true },
//     pincode: { type: String, required: true }
//   },
//   orderSummary: {
//     subtotal: { type: Number, required: true },
//     shipping: { type: Number, required: true },
//     tax: { type: Number, required: true },
//     discount: { type: Number, default: 0 },
//     total: { type: Number, required: true }
//   },
//   shippingMethod: {
//     type: String,
//     enum: ['standard', 'express', 'free'],
//     required: true
//   },
//   paymentMethod: {
//     type: String,
//    enum: ['razorpay', 'cod', 'qr', 'upi_qr'],
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
//     default: 'pending'
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'completed', 'failed', 'refunded'],
//     default: 'pending'
//   },
//   razorpayOrderId: {
//     type: String
//   },
//   razorpayPaymentId: {
//     type: String
//   },
//   refundStatus: {
//     type: String,
//     enum: ['none', 'requested', 'processed', 'completed'],
//     default: 'none'
//   },
//   deliveryDate: {
//     type: Date,
//     default: null
//   },
//   expectedDelivery: {
//     type: Date,
//     default: function() {
//       const date = new Date();
//       if (this.shippingMethod === 'express') {
//         date.setDate(date.getDate() + 3);
//       } else if (this.shippingMethod === 'standard') {
//         date.setDate(date.getDate() + 7);
//       } else {
//         date.setDate(date.getDate() + 10);
//       }
//       return date;
//     }
//   }
// }, {
//   timestamps: true
// });




// //-----------------------

// // orderSchema.index({ orderNumber: 1 }, { unique: true });

// export default mongoose.model("Order", orderSchema);










import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return `SKP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    }
  }],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  orderSummary: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'free'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod', 'qr', 'upi_qr'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'return_approved', 'return_processed', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  returnStatus: {
    type: String,
    enum: ['none', 'requested', 'approved', 'processed', 'refunded'],
    default: 'none'
  },
  returnInfo: {
    reason: String,
    description: String,
    items: [String], // item IDs
    requestedAt: Date,
    approvedAt: Date,
    pickupScheduled: Date,
    refundProcessedAt: Date,
    refundAmount: Number,
    instructions: String
  },
  deliveryDate: {
    type: Date,
    default: null
  },
  expectedDelivery: {
    type: Date,
    default: function() {
      const date = new Date();
      if (this.shippingMethod === 'express') {
        date.setDate(date.getDate() + 3);
      } else if (this.shippingMethod === 'standard') {
        date.setDate(date.getDate() + 7);
      } else {
        date.setDate(date.getDate() + 10);
      }
      return date;
    }
  }
}, {
  timestamps: true
});

export default mongoose.model("Order", orderSchema);