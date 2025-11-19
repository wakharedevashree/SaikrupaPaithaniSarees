// import Razorpay from 'razorpay';
// import Order from '../models/Order.js';
// import Cart from '../models/Cart.js';

// // 🔥 LAZY INITIALIZATION - Initialize Razorpay only when needed
// let razorpayInstance = null;

// const initializeRazorpay = () => {
//   if (!razorpayInstance) {
//     // Validate environment variables
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//       throw new Error('Razorpay credentials are missing. Please check your environment variables.');
//     }
    
//     razorpayInstance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET
//     });
    
//     console.log('✅ Razorpay initialized successfully');
//   }
//   return razorpayInstance;
// };

// // Create Razorpay order
// export const createRazorpayOrder = async (req, res) => {
//   try {
//     // Initialize Razorpay when first used
//     const razorpay = initializeRazorpay();
    
//     const userId = req.userId;
//     const { amount, currency = 'INR', receipt } = req.body;

//     console.log("💰 Creating Razorpay order for amount:", amount);

//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     const options = {
//       amount: Math.round(amount * 100),
//       currency: currency,
//       receipt: receipt || `receipt_${Date.now()}`,
//       payment_capture: 1
//     };

//     console.log("📦 Razorpay options:", options);

//     const razorpayOrder = await razorpay.orders.create(options);
    
//     console.log("✅ Razorpay order created:", razorpayOrder.id);

//     res.json({
//       success: true,
//       order: razorpayOrder,
//       key: process.env.RAZORPAY_KEY_ID
//     });

//   } catch (error) {
//     console.error("❌ Razorpay order creation error:", error);
    
//     // Provide more specific error messages
//     let errorMessage = "Failed to create payment order";
//     if (error.error && error.error.description) {
//       errorMessage = error.error.description;
//     } else if (error.message.includes('key_id')) {
//       errorMessage = "Payment gateway configuration error. Please contact support.";
//     }
    
//     res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error: error.message
//     });
//   }
// };

// // Verify Razorpay payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       orderData
//     } = req.body;

//     console.log("🔍 Verifying payment:", {
//       razorpay_order_id,
//       razorpay_payment_id,
//       orderData: orderData ? "present" : "missing"
//     });

//     // Verify payment signature
//     const crypto = require('crypto');
    
//     if (!process.env.RAZORPAY_KEY_SECRET) {
//       throw new Error('Razorpay key secret not configured');
//     }
    
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest('hex');

//     if (expectedSignature !== razorpay_signature) {
//       console.error("❌ Payment signature verification failed");
//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed"
//       });
//     }

//     console.log("✅ Payment signature verified successfully");

//     // Create order in database
//     if (orderData) {
//       const {
//         shippingAddress,
//         paymentMethod,
//         shippingMethod,
//         items
//       } = orderData;

//       // Calculate order totals
//       const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
//       let shipping = 0;
//       if (shippingMethod === 'express') shipping = 500;
//       else if (shippingMethod === 'standard') shipping = 200;
//       else if (shippingMethod === 'free') shipping = subtotal > 10000 ? 0 : 200;

//       const tax = Math.round(subtotal * 0.02);
//       const discount = subtotal > 5000 ? Math.round(subtotal * 0.1) : 0;
//       const total = subtotal + shipping + tax - discount;

//       // Calculate expected delivery date
//       const expectedDelivery = new Date();
//       if (shippingMethod === 'express') {
//         expectedDelivery.setDate(expectedDelivery.getDate() + 3);
//       } else if (shippingMethod === 'standard') {
//         expectedDelivery.setDate(expectedDelivery.getDate() + 7);
//       } else {
//         expectedDelivery.setDate(expectedDelivery.getDate() + 10);
//       }

//       // Create order in database
//       const order = new Order({
//         userId: req.userId,
//         items,
//         shippingAddress,
//         orderSummary: {
//           subtotal,
//           shipping,
//           tax,
//           discount,
//           total
//         },
//         shippingMethod,
//         paymentMethod: 'razorpay',
//         paymentStatus: 'completed',
//         razorpayOrderId: razorpay_order_id,
//         razorpayPaymentId: razorpay_payment_id,
//         expectedDelivery
//       });

//       await order.save();
//       console.log("✅ Order saved to database:", order.orderNumber);

//       // Clear user's cart
//       await Cart.findOneAndUpdate(
//         { userId: req.userId },
//         { items: [] }
//       );

//       res.json({
//         success: true,
//         message: "Payment verified and order created successfully",
//         order: {
//           _id: order._id,
//           orderNumber: order.orderNumber,
//           total: order.orderSummary.total,
//           status: order.status,
//           expectedDelivery: order.expectedDelivery
//         },
//         paymentId: razorpay_payment_id
//       });
//     } else {
//       res.json({
//         success: true,
//         message: "Payment verified successfully",
//         paymentId: razorpay_payment_id
//       });
//     }

//   } catch (error) {
//     console.error("❌ Payment verification error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Payment verification failed",
//       error: error.message
//     });
//   }
// };

// // Generate QR Code for UPI payments
// export const generateQRCode = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     // Generate UPI URL
//     const upiId = 'rahulbhandge@ybl';
//     const upiUrl = `upi://pay?pa=${upiId}&pn=SaiKrupa%20Paithani&am=${amount}&cu=INR&tn=Paithani%20Purchase`;

//     res.json({
//       success: true,
//       upiUrl: upiUrl,
//       amount: amount,
//       upiId: upiId
//     });

//   } catch (error) {
//     console.error("❌ QR code generation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate QR code",
//       error: error.message
//     });
//   }
// };

// // Get payment status
// export const getPaymentStatus = async (req, res) => {
//   try {
//     // Initialize Razorpay when first used
//     const razorpay = initializeRazorpay();
    
//     const { orderId } = req.params;

//     const payment = await razorpay.payments.fetch(orderId);
    
//     res.json({
//       success: true,
//       payment
//     });
//   } catch (error) {
//     console.error("❌ Get payment status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payment status",
//       error: error.message
//     });
//   }
// };












import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// 🔥 LAZY INITIALIZATION - Initialize Razorpay only when needed
let razorpayInstance = null;

const initializeRazorpay = () => {
  if (!razorpayInstance) {
    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are missing. Please check your environment variables.');
    }
    
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    console.log('✅ Razorpay initialized successfully');
  }
  return razorpayInstance;
};

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    // Initialize Razorpay when first used
    const razorpay = initializeRazorpay();
    
    const userId = req.userId;
    const { amount, currency = 'INR', receipt } = req.body;

    console.log("💰 Creating Razorpay order for amount:", amount);

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    console.log("📦 Razorpay options:", options);

    const razorpayOrder = await razorpay.orders.create(options);
    
    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("❌ Razorpay order creation error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to create payment order";
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message.includes('key_id')) {
      errorMessage = "Payment gateway configuration error. Please contact support.";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    console.log("🔍 Verifying payment:", {
      razorpay_order_id,
      razorpay_payment_id,
      orderData: orderData ? "present" : "missing"
    });

    // Verify payment signature
    const crypto = require('crypto');
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay key secret not configured');
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Payment signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    console.log("✅ Payment signature verified successfully");

    // Create order in database
    if (orderData) {
      const {
        shippingAddress,
        paymentMethod,
        shippingMethod,
        items
      } = orderData;

      // Calculate order totals - REMOVED SHIPPING AND TAX
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // No shipping charges
      const shipping = 0;
      // No tax
      const tax = 0;
      // No discount for testing
      const discount = 0;
      const total = subtotal; // Only subtotal

      // Calculate expected delivery date
      const expectedDelivery = new Date();
      if (shippingMethod === 'express') {
        expectedDelivery.setDate(expectedDelivery.getDate() + 3);
      } else if (shippingMethod === 'standard') {
        expectedDelivery.setDate(expectedDelivery.getDate() + 7);
      } else {
        expectedDelivery.setDate(expectedDelivery.getDate() + 10);
      }

      // Create order in database
      const order = new Order({
        userId: req.userId,
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
        paymentMethod: orderData.paymentMethod || 'razorpay',
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        expectedDelivery
      });

      await order.save();
      console.log("✅ Order saved to database:", order.orderNumber);

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { userId: req.userId },
        { items: [] }
      );

      res.json({
        success: true,
        message: "Payment verified and order created successfully",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.orderSummary.total,
          status: order.status,
          expectedDelivery: order.expectedDelivery
        },
        paymentId: razorpay_payment_id
      });
    } else {
      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id
      });
    }

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};

// Generate QR Code for UPI payments - DIRECT TO YOUR ACCOUNT
export const generateQRCode = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Generate UPI URL - DIRECT TO YOUR ACCOUNT
    const upiId = 'rahulbhandge@ybl'; // CHANGED TO YOUR UPI ID
    const transactionId = `SKP${Date.now()}`;
    const upiUrl = `upi://pay?pa=${upiId}&pn=SaiKrupa%20Paithani&am=${amount}&cu=INR&tn=Order%20${transactionId}`;

    res.json({
      success: true,
      upiUrl: upiUrl,
      amount: amount,
      upiId: upiId,
      transactionId: transactionId
    });

  } catch (error) {
    console.error("❌ QR code generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR code",
      error: error.message
    });
  }
};

// Verify UPI Payment
export const verifyUPIPayment = async (req, res) => {
  try {
    const { transactionId, amount } = req.body;

    console.log("🔍 Verifying UPI payment:", { transactionId, amount });

    // For direct UPI payments, we'll assume payment is successful for testing
    // In production, you would integrate with bank APIs or manual verification
    
    const paymentRecord = {
      transactionId: transactionId,
      amount: amount,
      upiId: 'rahulbhandge@ybl',
      status: 'completed',
      timestamp: new Date(),
      type: 'upi_direct'
    };

    console.log("✅ UPI Payment recorded:", paymentRecord);

    res.json({
      success: true,
      message: "UPI payment verified successfully",
      paymentRecord: paymentRecord,
      verified: true
    });

  } catch (error) {
    console.error("❌ UPI verification error:", error);
    res.status(500).json({
      success: false,
      message: "UPI verification failed",
      error: error.message
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    // Initialize Razorpay when first used
    const razorpay = initializeRazorpay();
    
    const { orderId } = req.params;

    const payment = await razorpay.payments.fetch(orderId);
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("❌ Get payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment status",
      error: error.message
    });
  }
};

