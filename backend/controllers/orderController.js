



// import Order from "../models/Order.js";
// import Cart from "../models/Cart.js";

// // Create new order
// export const createOrder = async (req, res) => {
//   try {
//     const userId = req.userId;
    
//     const {
//       shippingAddress,
//       paymentMethod,
//       shippingMethod,
//       items
//     } = req.body;

//     console.log("📦 Received order data:", {
//       userId,
//       shippingAddress,
//       paymentMethod,
//       shippingMethod,
//       itemsCount: items?.length
//     });

//     // Validate required fields
//     if (!shippingAddress || !paymentMethod || !shippingMethod || !items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields"
//       });
//     }

//     // Calculate order totals
//     const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
//     let shipping = 0;
//     if (shippingMethod === 'express') shipping = 500;
//     else if (shippingMethod === 'standard') shipping = 200;
//     else if (shippingMethod === 'free') shipping = subtotal > 10000 ? 0 : 200;

//     const tax = Math.round(subtotal * 0.02);
//     const discount = subtotal > 5000 ? Math.round(subtotal * 0.1) : 0;
    
//     // Add COD charges if applicable
//     const codCharges = paymentMethod === 'cod' ? 50 : 0;
//     const total = subtotal + shipping + tax - discount + codCharges;

//     // Calculate expected delivery date
//     const expectedDelivery = new Date();
//     if (shippingMethod === 'express') {
//       expectedDelivery.setDate(expectedDelivery.getDate() + 3);
//     } else if (shippingMethod === 'standard') {
//       expectedDelivery.setDate(expectedDelivery.getDate() + 7);
//     } else {
//       expectedDelivery.setDate(expectedDelivery.getDate() + 10);
//     }

//     console.log("💰 Order totals:", { subtotal, shipping, tax, discount, codCharges, total });

//     // Create order
//     const order = new Order({
//       userId,
//       items,
//       shippingAddress,
//       orderSummary: {
//         subtotal,
//         shipping,
//         tax,
//         discount,
//         total
//       },
//       shippingMethod,
//       paymentMethod,
//       paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
//       expectedDelivery
//     });

//     console.log("🔢 Order object before save:", order);

//     await order.save();
//     console.log("✅ Order saved to database. Order Number:", order.orderNumber);

//     // Clear user's cart after successful order
//     await Cart.findOneAndUpdate(
//       { userId },
//       { items: [] }
//     );
//     console.log("🛒 Cart cleared for user:", userId);

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order: {
//         _id: order._id,
//         orderNumber: order.orderNumber,
//         total: order.orderSummary.total,
//         status: order.status,
//         expectedDelivery: order.expectedDelivery
//       }
//     });

//   } catch (error) {
//     console.error("❌ Create order error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create order",
//       error: error.message
//     });
//   }
// };

// // Get user orders
// export const getUserOrders = async (req, res) => {
//   try {
//     const userId = req.userId;
    
//     const orders = await Order.find({ userId })
//       .sort({ createdAt: -1 })
//       .populate('items.productId', 'name images');

//     res.json({
//       success: true,
//       orders
//     });
//   } catch (error) {
//     console.error("❌ Get orders error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch orders",
//       error: error.message
//     });
//   }
// };

// // Get single order
// export const getOrderById = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const userId = req.userId;

//     const order = await Order.findOne({ _id: orderId })
//       .populate('items.productId', 'name images description');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     res.json({
//       success: true,
//       order
//     });
//   } catch (error) {
//     console.error("❌ Get order error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch order",
//       error: error.message
//     });
//   }
// };

// // Get all orders (admin)
// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate('userId', 'name email')
//       .populate('items.productId', 'name images price')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       orders
//     });
//   } catch (error) {
//     console.error("❌ Get all orders error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch orders",
//       error: error.message
//     });
//   }
// };

// // Update order status
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status, deliveryDate } = req.body;

//     const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status"
//       });
//     }

//     const updateData = { status };
    
//     // If status is delivered and deliveryDate is provided, update delivery date
//     if (status === 'delivered' && deliveryDate) {
//       updateData.deliveryDate = new Date(deliveryDate);
//     }
    
//     // If status is shipped, set expected delivery if not already set
//     if (status === 'shipped' && !deliveryDate) {
//       const expectedDelivery = new Date();
//       expectedDelivery.setDate(expectedDelivery.getDate() + 7);
//       updateData.expectedDelivery = expectedDelivery;
//     }

//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       updateData,
//       { new: true }
//     ).populate('items.productId', 'name images');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Order status updated successfully",
//       order
//     });
//   } catch (error) {
//     console.error("❌ Update order status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update order status",
//       error: error.message
//     });
//   }
// };



// // Update delivery date
// export const updateDeliveryDate = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { deliveryDate } = req.body;

//     console.log("📅 Updating delivery date for order:", orderId, "Date:", deliveryDate);

//     if (!deliveryDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Delivery date is required"
//       });
//     }

//     // Validate date format
//     const deliveryDateObj = new Date(deliveryDate);
//     if (isNaN(deliveryDateObj.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid date format"
//       });
//     }

//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       { 
//         deliveryDate: deliveryDateObj,
//         expectedDelivery: deliveryDateObj
//       },
//       { new: true }
//     ).populate('items.productId', 'name images');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     console.log("✅ Delivery date updated successfully for order:", orderId);

//     res.json({
//       success: true,
//       message: "Delivery date updated successfully",
//       order: {
//         _id: order._id,
//         orderNumber: order.orderNumber,
//         deliveryDate: order.deliveryDate,
//         expectedDelivery: order.expectedDelivery,
//         status: order.status
//       }
//     });
//   } catch (error) {
//     console.error("❌ Update delivery date error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update delivery date",
//       error: error.message
//     });
//   }
// };

// // Delete order (admin)
// export const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     console.log("🗑️ Attempting to delete order:", orderId);

//     const order = await Order.findByIdAndDelete(orderId);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     console.log("✅ Order deleted successfully:", orderId);

//     res.json({
//       success: true,
//       message: "Order deleted successfully"
//     });
//   } catch (error) {
//     console.error("❌ Delete order error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete order",
//       error: error.message
//     });
//   }
// };

// // Update payment status
// export const updatePaymentStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { paymentStatus } = req.body;

//     const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
//     if (!validStatuses.includes(paymentStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment status"
//       });
//     }

//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       { paymentStatus },
//       { new: true }
//     ).populate('items.productId', 'name images');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Payment status updated successfully",
//       order
//     });
//   } catch (error) {
//     console.error("❌ Update payment status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update payment status",
//       error: error.message
//     });
//   }
// };






import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    
    const {
      shippingAddress,
      paymentMethod,
      shippingMethod,
      items
    } = req.body;

    console.log("📦 Received order data:", {
      userId,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      itemsCount: items?.length
    });

    // Validate required fields
    if (!shippingAddress || !paymentMethod || !shippingMethod || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Calculate order totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let shipping = 0;
    if (shippingMethod === 'express') shipping = 500;
    else if (shippingMethod === 'standard') shipping = 200;
    else if (shippingMethod === 'free') shipping = subtotal > 10000 ? 0 : 200;

    const tax = Math.round(subtotal * 0.02);
    const discount = subtotal > 5000 ? Math.round(subtotal * 0.1) : 0;
    
    // Add COD charges if applicable
    const codCharges = paymentMethod === 'cod' ? 50 : 0;
    const total = subtotal + shipping + tax - discount + codCharges;

    // Calculate expected delivery date
    const expectedDelivery = new Date();
    if (shippingMethod === 'express') {
      expectedDelivery.setDate(expectedDelivery.getDate() + 3);
    } else if (shippingMethod === 'standard') {
      expectedDelivery.setDate(expectedDelivery.getDate() + 7);
    } else {
      expectedDelivery.setDate(expectedDelivery.getDate() + 10);
    }

    console.log("💰 Order totals:", { subtotal, shipping, tax, discount, codCharges, total });

    // Create order
    const order = new Order({
      userId,
      items,
      shippingAddress,
      orderSummary: {
        subtotal,
        shipping,
        tax,
        discount,
        total
      },
      shippingMethod,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      expectedDelivery
    });

    console.log("🔢 Order object before save:", order);

    await order.save();
    console.log("✅ Order saved to database. Order Number:", order.orderNumber);

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { userId },
      { items: [] }
    );
    console.log("🛒 Cart cleared for user:", userId);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.orderSummary.total,
        status: order.status,
        expectedDelivery: order.expectedDelivery
      }
    });

  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name images');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("❌ Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: orderId })
      .populate('items.productId', 'name images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("❌ Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryDate } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'return_approved', 'return_processed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const updateData = { status };
    
    // If status is delivered and deliveryDate is provided, update delivery date
    if (status === 'delivered' && deliveryDate) {
      updateData.deliveryDate = new Date(deliveryDate);
    }
    
    // If status is shipped, set expected delivery if not already set
    if (status === 'shipped' && !deliveryDate) {
      const expectedDelivery = new Date();
      expectedDelivery.setDate(expectedDelivery.getDate() + 7);
      updateData.expectedDelivery = expectedDelivery;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};

// Update delivery date
export const updateDeliveryDate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryDate } = req.body;

    console.log("📅 Updating delivery date for order:", orderId, "Date:", deliveryDate);

    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "Delivery date is required"
      });
    }

    // Validate date format
    const deliveryDateObj = new Date(deliveryDate);
    if (isNaN(deliveryDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        deliveryDate: deliveryDateObj,
        expectedDelivery: deliveryDateObj
      },
      { new: true }
    ).populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log("✅ Delivery date updated successfully for order:", orderId);

    res.json({
      success: true,
      message: "Delivery date updated successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        deliveryDate: order.deliveryDate,
        expectedDelivery: order.expectedDelivery,
        status: order.status
      }
    });
  } catch (error) {
    console.error("❌ Update delivery date error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update delivery date",
      error: error.message
    });
  }
};

// Delete order (admin)
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("🗑️ Attempting to delete order:", orderId);

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log("✅ Order deleted successfully:", orderId);

    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    ).populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Payment status updated successfully",
      order
    });
  } catch (error) {
    console.error("❌ Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message
    });
  }
};

// Request return for an order
export const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, description, items } = req.body;

    console.log("🔄 Processing return request for order:", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Return can only be requested for delivered orders"
      });
    }

    // Check if return is within allowed period (7 days)
    const deliveryDate = new Date(order.deliveryDate);
    const currentDate = new Date();
    const daysSinceDelivery = Math.floor((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceDelivery > 7) {
      return res.status(400).json({
        success: false,
        message: "Return period has expired. Returns must be requested within 7 days of delivery."
      });
    }

    // Check if return already requested
    if (order.returnStatus && order.returnStatus !== 'none') {
      return res.status(400).json({
        success: false,
        message: "Return request already exists for this order"
      });
    }

    // Update order with return information
    order.returnStatus = 'requested';
    order.status = 'return_requested';
    order.returnInfo = {
      reason,
      description,
      items: items || [],
      requestedAt: new Date()
    };

    await order.save();

    console.log("✅ Return request submitted for order:", orderId);

    res.json({
      success: true,
      message: "Return request submitted successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        returnStatus: order.returnStatus,
        returnInfo: order.returnInfo
      }
    });

  } catch (error) {
    console.error("❌ Return request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process return request",
      error: error.message
    });
  }
};

// Update return status (admin)
export const updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { returnStatus, instructions, refundAmount } = req.body;

    const validStatuses = ['none', 'requested', 'approved', 'processed', 'refunded'];
    if (!validStatuses.includes(returnStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update return info
    if (!order.returnInfo) {
      order.returnInfo = {};
    }

    if (returnStatus === 'approved') {
      order.returnInfo.approvedAt = new Date();
      order.status = 'return_approved';
    } else if (returnStatus === 'processed') {
      order.returnInfo.pickupScheduled = new Date();
      order.status = 'return_processed';
    } else if (returnStatus === 'refunded') {
      order.returnInfo.refundProcessedAt = new Date();
      order.returnInfo.refundAmount = refundAmount || order.orderSummary.total;
      order.status = 'refunded';
      order.paymentStatus = 'refunded';
    }

    if (instructions) {
      order.returnInfo.instructions = instructions;
    }

    order.returnStatus = returnStatus;
    await order.save();

    res.json({
      success: true,
      message: "Return status updated successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        returnStatus: order.returnStatus,
        returnInfo: order.returnInfo
      }
    });

  } catch (error) {
    console.error("❌ Update return status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update return status",
      error: error.message
    });
  }
};