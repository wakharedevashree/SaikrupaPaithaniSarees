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
//     const upiId = 'paithanistore@razorpay';
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
















// import axios from 'axios';
// import Order from '../models/Order.js';
// import Cart from '../models/Cart.js';

// // Cashfree configuration
// const CASHFREE_CONFIG = {
//   appId: process.env.CASHFREE_APP_ID,
//   secretKey: process.env.CASHFREE_SECRET_KEY,
//   environment: process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION',
//   baseURL: process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' 
//     ? 'https://api.cashfree.com/pg' 
//     : 'https://sandbox.cashfree.com/pg'
// };

// // Create Cashfree order
// export const createCashfreeOrder = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { amount, currency = 'INR', customerDetails, orderId } = req.body;

//     console.log("💰 Creating Cashfree order for amount:", amount);

//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     // Generate unique order ID if not provided
//     const cfOrderId = orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     const orderData = {
//       order_id: cfOrderId,
//       order_amount: amount,
//       order_currency: currency,
//       customer_details: customerDetails || {
//         customer_id: userId.toString(),
//         customer_email: 'customer@example.com',
//         customer_phone: '9999999999'
//       },
//       order_meta: {
//         return_url: `http://localhost:5000/payment/return?order_id=${cfOrderId}`
//       }
//     };

//     console.log("📦 Cashfree order data:", orderData);

//     const response = await axios.post(`${CASHFREE_CONFIG.baseURL}/orders`, orderData, {
//       headers: {
//         'Content-Type': 'application/json',
//         'x-client-id': CASHFREE_CONFIG.appId,
//         'x-client-secret': CASHFREE_CONFIG.secretKey,
//         'x-api-version': '2022-09-01'
//       }
//     });

//     console.log("✅ Cashfree order created:", response.data);

//     res.json({
//       success: true,
//       order: response.data,
//       environment: CASHFREE_CONFIG.environment
//     });

//   } catch (error) {
//     console.error("❌ Cashfree order creation error:", error.response?.data || error.message);
    
//     let errorMessage = "Failed to create payment order";
//     if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     }
    
//     res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Verify Cashfree payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       order_id,
//       payment_details
//     } = req.body;

//     console.log("🔍 Verifying payment for order:", order_id);

//     // Verify payment with Cashfree
//     const response = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders/${order_id}/payments`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         }
//       }
//     );

//     const payments = response.data;
//     console.log("💰 Payment details:", payments);

//     if (!payments || payments.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No payment found for this order"
//       });
//     }

//     const payment = payments[0];
//     const isPaymentSuccessful = payment.payment_status === 'SUCCESS';

//     if (!isPaymentSuccessful) {
//       return res.status(400).json({
//         success: false,
//         message: `Payment ${payment.payment_status}`,
//         paymentStatus: payment.payment_status
//       });
//     }

//     console.log("✅ Payment verified successfully");

//     // Create order in database if orderData is provided
//     if (req.body.orderData) {
//       const {
//         shippingAddress,
//         paymentMethod,
//         shippingMethod,
//         items
//       } = req.body.orderData;

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
//         paymentMethod: 'cashfree',
//         paymentStatus: 'completed',
//         cashfreeOrderId: order_id,
//         cashfreePaymentId: payment.cf_payment_id,
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
//         paymentId: payment.cf_payment_id
//       });
//     } else {
//       res.json({
//         success: true,
//         message: "Payment verified successfully",
//         paymentId: payment.cf_payment_id
//       });
//     }

//   } catch (error) {
//     console.error("❌ Payment verification error:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Payment verification failed",
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Generate QR Code for UPI payments (Cashfree supports native UPI QR)
// export const generateQRCode = async (req, res) => {
//   try {
//     const { amount, orderId } = req.body;

//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     // Create order for QR code
//     const cfOrderId = orderId || `qr_order_${Date.now()}`;
    
//     const orderData = {
//       order_id: cfOrderId,
//       order_amount: amount,
//       order_currency: 'INR',
//       order_note: 'UPI QR Payment',
//       customer_details: {
//         customer_id: req.userId.toString()
//       }
//     };

//     const response = await axios.post(`${CASHFREE_CONFIG.baseURL}/orders`, orderData, {
//       headers: {
//         'Content-Type': 'application/json',
//         'x-client-id': CASHFREE_CONFIG.appId,
//         'x-client-secret': CASHFREE_CONFIG.secretKey,
//         'x-api-version': '2022-09-01'
//       }
//     });

//     // For Cashfree, you can use their QR code generation
//     // This is a simplified version - you might want to use Cashfree's QR API
//     const qrData = {
//       orderId: cfOrderId,
//       amount: amount,
//       upiId: 'rahulbhandge@ybl', // This would be your UPI ID
//       qrString: `upi://pay?pa=paithanistore@cashfree&pn=SaiKrupa%20Paithani&am=${amount}&cu=INR`
//     };

//     res.json({
//       success: true,
//       qrData: qrData,
//       order: response.data,
//       amount: amount
//     });

//   } catch (error) {
//     console.error("❌ QR code generation error:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate QR code",
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Get payment status
// export const getPaymentStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const response = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders/${orderId}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         }
//       }
//     );

//     const orderData = response.data;
    
//     res.json({
//       success: true,
//       order: orderData
//     });
//   } catch (error) {
//     console.error("❌ Get payment status error:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payment status",
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Cashfree webhook handler
// export const handleWebhook = async (req, res) => {
//   try {
//     const webhookData = req.body;
//     console.log("🔔 Cashfree webhook received:", webhookData);

//     // Verify webhook signature (recommended for production)
//     // const signature = req.headers['x-webhook-signature'];
    
//     const { orderId, paymentStatus, paymentAmount, paymentCurrency, transactionId } = webhookData;

//     // Update order status based on webhook
//     if (orderId) {
//       const order = await Order.findOne({ cashfreeOrderId: orderId });
//       if (order) {
//         order.paymentStatus = paymentStatus === 'SUCCESS' ? 'completed' : 'failed';
//         if (transactionId) {
//           order.cashfreePaymentId = transactionId;
//         }
//         await order.save();
//         console.log(`✅ Order ${orderId} updated to ${paymentStatus}`);
//       }
//     }

//     res.status(200).json({ success: true, message: "Webhook processed" });
//   } catch (error) {
//     console.error("❌ Webhook processing error:", error);
//     res.status(500).json({ success: false, message: "Webhook processing failed" });
//   }
// };












// import axios from 'axios';
// import Order from '../models/Order.js';
// import Cart from '../models/Cart.js';

// // Cashfree configuration with debugging
// const CASHFREE_CONFIG = {
//   appId: process.env.CASHFREE_APP_ID,
//   secretKey: process.env.CASHFREE_SECRET_KEY,
//   environment: process.env.CASHFREE_ENVIRONMENT || 'SANDBOX', // Default to sandbox
//   baseURL: process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' 
//     ? 'https://api.cashfree.com/pg' 
//     : 'https://sandbox.cashfree.com/pg'
// };

// // Debug function to check configuration
// const checkCashfreeConfig = () => {
//   console.log('🔧 Cashfree Configuration Check:');
//   console.log('🌍 Environment:', CASHFREE_CONFIG.environment);
//   console.log('🔗 Base URL:', CASHFREE_CONFIG.baseURL);
//   console.log('🔑 App ID exists:', !!CASHFREE_CONFIG.appId);
//   console.log('🔑 Secret Key exists:', !!CASHFREE_CONFIG.secretKey);
  
//   if (!CASHFREE_CONFIG.appId || !CASHFREE_CONFIG.secretKey) {
//     console.error('❌ MISSING: Cashfree credentials not found in environment variables');
//     return false;
//   }
//   return true;
// };

// // Create Cashfree order
// export const createCashfreeOrder = async (req, res) => {
//   try {
//     // Check configuration first
//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const userId = req.userId;
//     const { amount, currency = 'INR', customerDetails } = req.body;

//     console.log("💰 Creating Cashfree order for amount:", amount);
//     console.log("👤 User ID:", userId);

//     // Validate amount
//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     // Generate unique order ID
//     const cfOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     const orderData = {
//       order_id: cfOrderId,
//       order_amount: amount,
//       order_currency: currency,
//       customer_details: {
//         customer_id: userId.toString(),
//         customer_name: customerDetails?.customer_name || 'Test Customer',
//         customer_email: customerDetails?.customer_email || 'test@example.com',
//         customer_phone: customerDetails?.customer_phone || '9876543210'
//       },
//       order_meta: {
//         return_url: `http://localhost:3000/payment/return?order_id=${cfOrderId}`
//       }
//     };

//     console.log("📦 Cashfree order data:", JSON.stringify(orderData, null, 2));

//     // Prepare headers
//     const headers = {
//       'Content-Type': 'application/json',
//       'x-client-id': CASHFREE_CONFIG.appId,
//       'x-client-secret': CASHFREE_CONFIG.secretKey,
//       'x-api-version': '2022-09-01'
//     };

//     console.log("🔐 Making request to:", `${CASHFREE_CONFIG.baseURL}/orders`);

//     const response = await axios.post(
//       `${CASHFREE_CONFIG.baseURL}/orders`,
//       orderData,
//       { 
//         headers,
//         timeout: 15000
//       }
//     );

//     console.log("✅ Cashfree order created successfully");
//     console.log("📄 Response:", response.data);

//     res.json({
//       success: true,
//       order: response.data,
//       environment: CASHFREE_CONFIG.environment
//     });

//   } catch (error) {
//     console.error("❌ Cashfree order creation FAILED:");
    
//     if (error.response) {
//       // Cashfree API responded with error
//       console.error("📊 Error Response Details:");
//       console.error("Status:", error.response.status);
//       console.error("Data:", error.response.data);
//       console.error("Headers:", error.response.headers);
      
//       // More specific error messages
//       let userMessage = "Payment gateway error";
//       if (error.response.status === 401) {
//         userMessage = "Payment gateway authentication failed. Please check configuration.";
//       } else if (error.response.status === 400) {
//         userMessage = "Invalid request to payment gateway";
//       } else if (error.response.status === 500) {
//         userMessage = "Payment gateway server error";
//       }
      
//       res.status(error.response.status).json({
//         success: false,
//         message: userMessage,
//         error: error.response.data,
//         debug: {
//           environment: CASHFREE_CONFIG.environment,
//           baseURL: CASHFREE_CONFIG.baseURL
//         }
//       });
//     } else if (error.request) {
//       // No response received
//       console.error("❌ No response received from Cashfree API");
//       console.error("Request:", error.request);
      
//       res.status(503).json({
//         success: false,
//         message: "Payment gateway is not responding. Please try again.",
//         error: "Network error - no response received"
//       });
//     } else {
//       // Other errors
//       console.error("❌ Setup error:", error.message);
//       res.status(500).json({
//         success: false,
//         message: "Payment setup failed",
//         error: error.message
//       });
//     }
//   }
// };

// // Verify Cashfree payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const { order_id, orderData } = req.body;

//     console.log("🔍 Verifying payment for order:", order_id);

//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const response = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders/${order_id}/payments`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         }
//       }
//     );

//     const payments = response.data;
//     console.log("💰 Payment details:", payments);

//     if (!payments || payments.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No payment found for this order"
//       });
//     }

//     const payment = payments[0];
//     const isPaymentSuccessful = payment.payment_status === 'SUCCESS';

//     if (!isPaymentSuccessful) {
//       return res.status(400).json({
//         success: false,
//         message: `Payment ${payment.payment_status}`,
//         paymentStatus: payment.payment_status
//       });
//     }

//     console.log("✅ Payment verified successfully");

//     // Create order in database if orderData is provided
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
//         paymentMethod: 'cashfree',
//         paymentStatus: 'completed',
//         cashfreeOrderId: order_id,
//         cashfreePaymentId: payment.cf_payment_id,
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
//         paymentId: payment.cf_payment_id
//       });
//     } else {
//       res.json({
//         success: true,
//         message: "Payment verified successfully",
//         paymentId: payment.cf_payment_id
//       });
//     }

//   } catch (error) {
//     console.error("❌ Payment verification error:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Payment verification failed",
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Generate QR Code for UPI payments
// export const generateQRCode = async (req, res) => {
//   try {
//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const { amount } = req.body;

//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     // For now, return a simple QR code data
//     // In production, you would integrate with Cashfree's QR API
//     const qrData = {
//       orderId: `qr_${Date.now()}`,
//       amount: amount,
//       upiId: 'rahulbhandge@ybl',
//       qrString: `upi://pay?pa=test@cashfree&pn=SaiKrupa%20Paithani&am=${amount}&cu=INR`,
//       note: 'This is a test QR code. For production, integrate with Cashfree QR API.'
//     };

//     res.json({
//       success: true,
//       qrData: qrData,
//       amount: amount,
//       environment: CASHFREE_CONFIG.environment
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
//     const { orderId } = req.params;

//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const response = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders/${orderId}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         }
//       }
//     );

//     const orderData = response.data;
    
//     res.json({
//       success: true,
//       order: orderData
//     });
//   } catch (error) {
//     console.error("❌ Get payment status error:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payment status",
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Cashfree webhook handler
// export const handleWebhook = async (req, res) => {
//   try {
//     const webhookData = req.body;
//     console.log("🔔 Cashfree webhook received:", webhookData);

//     const { orderId, paymentStatus, transactionId } = webhookData;

//     // Update order status based on webhook
//     if (orderId) {
//       const order = await Order.findOne({ cashfreeOrderId: orderId });
//       if (order) {
//         order.paymentStatus = paymentStatus === 'SUCCESS' ? 'completed' : 'failed';
//         if (transactionId) {
//           order.cashfreePaymentId = transactionId;
//         }
//         await order.save();
//         console.log(`✅ Order ${orderId} updated to ${paymentStatus}`);
//       }
//     }

//     res.status(200).json({ success: true, message: "Webhook processed" });
//   } catch (error) {
//     console.error("❌ Webhook processing error:", error);
//     res.status(500).json({ success: false, message: "Webhook processing failed" });
//   }
// };

// // Test endpoint to check Cashfree configuration
// export const testCashfreeConfig = async (req, res) => {
//   try {
//     console.log('🧪 Testing Cashfree configuration...');
    
//     const configCheck = checkCashfreeConfig();
    
//     if (!configCheck) {
//       return res.json({
//         success: false,
//         message: "Configuration check failed",
//         environment: CASHFREE_CONFIG.environment,
//         baseURL: CASHFREE_CONFIG.baseURL,
//         hasAppId: !!CASHFREE_CONFIG.appId,
//         hasSecretKey: !!CASHFREE_CONFIG.secretKey
//       });
//     }

//     // Try a simple API call to verify credentials
//     const testResponse = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders`,
//       {
//         headers: {
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         },
//         timeout: 10000
//       }
//     );

//     res.json({
//       success: true,
//       message: "Cashfree configuration is working",
//       environment: CASHFREE_CONFIG.environment,
//       baseURL: CASHFREE_CONFIG.baseURL,
//       testResponse: testResponse.data
//     });

//   } catch (error) {
//     console.error("❌ Cashfree test failed:", error.response?.data || error.message);
    
//     res.status(500).json({
//       success: false,
//       message: "Cashfree test failed",
//       error: error.response?.data || error.message,
//       environment: CASHFREE_CONFIG.environment,
//       baseURL: CASHFREE_CONFIG.baseURL
//     });
//   }
// };

// import axios from 'axios';
// import Order from '../models/Order.js';
// import Cart from '../models/Cart.js';

// // 🔥 HARDCODED CREDENTIALS - WILL WORK IMMEDIATELY
// const CASHFREE_CONFIG = {
//   appId: "113119408c59d0467a52033ed674911311",
//   secretKey: "cfsk_ma_prod_bdc3d8d9d28778b4a9b30ede7cf67baa_31782357",
//   environment: "PRODUCTION",
//   baseURL: "https://api.cashfree.com/pg"
// };

// console.log('=== PAYMENT CONTROLLER LOADED ===');
// console.log('✅ Cashfree Config:');
// console.log('   App ID:', CASHFREE_CONFIG.appId);
// console.log('   Secret Key:', CASHFREE_CONFIG.secretKey ? '***loaded***' : '✗ Missing');
// console.log('   Environment:', CASHFREE_CONFIG.environment);
// console.log('   Base URL:', CASHFREE_CONFIG.baseURL);

// // Debug function to check configuration
// const checkCashfreeConfig = () => {
//   console.log('🔧 Cashfree Configuration Check:');
//   console.log('🌍 Environment:', CASHFREE_CONFIG.environment);
//   console.log('🔗 Base URL:', CASHFREE_CONFIG.baseURL);
//   console.log('🔑 App ID:', CASHFREE_CONFIG.appId);
//   console.log('🔑 Secret Key:', CASHFREE_CONFIG.secretKey ? '***loaded***' : 'MISSING');
  
//   if (!CASHFREE_CONFIG.appId || !CASHFREE_CONFIG.secretKey) {
//     console.error('❌ MISSING: Cashfree credentials not found');
//     return false;
//   }
  
//   console.log('✅ Cashfree configuration is OK');
//   return true;
// };

// // Test endpoint
// export const testRoute = async (req, res) => {
//   console.log('✅ TEST ROUTE CALLED - Payment controller is working');
//   res.json({
//     success: true,
//     message: 'Payment controller is working!',
//     config: {
//       appId: CASHFREE_CONFIG.appId ? 'Loaded' : 'Missing',
//       environment: CASHFREE_CONFIG.environment,
//       baseURL: CASHFREE_CONFIG.baseURL
//     }
//   });
// };

// // Create Cashfree order
// export const createCashfreeOrder = async (req, res) => {
//   try {
//     console.log('=== CREATE CASHFREE ORDER CALLED ===');
//     console.log('📨 Request Body:', req.body);
//     console.log('👤 User ID from auth:', req.userId);
    
//     // Check configuration first
//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const userId = req.userId;
//     const { amount, currency = 'INR', customerDetails } = req.body;

//     console.log("💰 Creating Cashfree order for amount:", amount);
//     console.log("👤 User ID:", userId);

//     // Validate amount
//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     // Generate unique order ID
//     const cfOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     const orderData = {
//       order_id: cfOrderId,
//       order_amount: amount,
//       order_currency: currency,
//       customer_details: {
//         customer_id: userId.toString(),
//         customer_name: customerDetails?.customer_name || 'Test Customer',
//         customer_email: customerDetails?.customer_email || 'test@example.com',
//         customer_phone: customerDetails?.customer_phone || '9876543210'
//       },
//       order_meta: {
//         return_url: `http://localhost:3000/payment/return?order_id=${cfOrderId}`
//       }
//     };

//     console.log("📦 Cashfree order data:", JSON.stringify(orderData, null, 2));

//     // Prepare headers
//     const headers = {
//       'Content-Type': 'application/json',
//       'x-client-id': CASHFREE_CONFIG.appId,
//       'x-client-secret': CASHFREE_CONFIG.secretKey,
//       'x-api-version': '2022-09-01'
//     };

//     console.log("🔐 Making request to:", `${CASHFREE_CONFIG.baseURL}/orders`);
//     console.log("🔑 Using App ID:", CASHFREE_CONFIG.appId);

//     const response = await axios.post(
//       `${CASHFREE_CONFIG.baseURL}/orders`,
//       orderData,
//       { 
//         headers,
//         timeout: 15000
//       }
//     );

//     console.log("✅ Cashfree order created successfully");
//     console.log("📄 Response:", response.data);

//     res.json({
//       success: true,
//       order: response.data,
//       environment: CASHFREE_CONFIG.environment
//     });

//   } catch (error) {
//     console.error("❌ Cashfree order creation FAILED:");
    
//     if (error.response) {
//       // Cashfree API responded with error
//       console.error("📊 Error Response Details:");
//       console.error("Status:", error.response.status);
//       console.error("Data:", error.response.data);
//       console.error("Headers:", error.response.headers);
      
//       // More specific error messages
//       let userMessage = "Payment gateway error";
//       if (error.response.status === 401) {
//         userMessage = "Payment gateway authentication failed. Please check your Cashfree credentials.";
//       } else if (error.response.status === 400) {
//         userMessage = "Invalid request to payment gateway";
//       } else if (error.response.status === 500) {
//         userMessage = "Payment gateway server error";
//       }
      
//       res.status(error.response.status).json({
//         success: false,
//         message: userMessage,
//         error: error.response.data,
//         debug: {
//           environment: CASHFREE_CONFIG.environment,
//           baseURL: CASHFREE_CONFIG.baseURL,
//           appId: CASHFREE_CONFIG.appId ? '***loaded***' : 'MISSING'
//         }
//       });
//     } else if (error.request) {
//       // No response received
//       console.error("❌ No response received from Cashfree API");
//       console.error("Request:", error.request);
      
//       res.status(503).json({
//         success: false,
//         message: "Payment gateway is not responding. Please try again.",
//         error: "Network error - no response received"
//       });
//     } else {
//       // Other errors
//       console.error("❌ Setup error:", error.message);
//       res.status(500).json({
//         success: false,
//         message: "Payment setup failed",
//         error: error.message
//       });
//     }
//   }
// };

// // Verify Cashfree payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const { order_id, orderData } = req.body;

//     console.log("🔍 Verifying payment for order:", order_id);

//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const response = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders/${order_id}/payments`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         }
//       }
//     );

//     const payments = response.data;
//     console.log("💰 Payment details:", payments);

//     if (!payments || payments.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No payment found for this order"
//       });
//     }

//     const payment = payments[0];
//     const isPaymentSuccessful = payment.payment_status === 'SUCCESS';

//     if (!isPaymentSuccessful) {
//       return res.status(400).json({
//         success: false,
//         message: `Payment ${payment.payment_status}`,
//         paymentStatus: payment.payment_status
//       });
//     }

//     console.log("✅ Payment verified successfully");

//     // Create order in database if orderData is provided
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
//         paymentMethod: 'cashfree',
//         paymentStatus: 'completed',
//         cashfreeOrderId: order_id,
//         cashfreePaymentId: payment.cf_payment_id,
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
//         paymentId: payment.cf_payment_id
//       });
//     } else {
//       res.json({
//         success: true,
//         message: "Payment verified successfully",
//         paymentId: payment.cf_payment_id
//       });
//     }

//   } catch (error) {
//     console.error("❌ Payment verification error:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Payment verification failed",
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Generate QR Code for UPI payments
// export const generateQRCode = async (req, res) => {
//   try {
//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const { amount } = req.body;

//     if (!amount || amount < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount"
//       });
//     }

//     // For now, return a simple QR code data
//     const qrData = {
//       orderId: `qr_${Date.now()}`,
//       amount: amount,
//       upiId: 'rahulbhandge@ybl',
//       qrString: `upi://pay?pa=test@cashfree&pn=SaiKrupa%20Paithani&am=${amount}&cu=INR`,
//       note: 'This is a test QR code. For production, integrate with Cashfree QR API.'
//     };

//     res.json({
//       success: true,
//       qrData: qrData,
//       amount: amount,
//       environment: CASHFREE_CONFIG.environment
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
//     const { orderId } = req.params;

//     if (!checkCashfreeConfig()) {
//       return res.status(500).json({
//         success: false,
//         message: "Payment gateway configuration error"
//       });
//     }

//     const response = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders/${orderId}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         }
//       }
//     );

//     const orderData = response.data;
    
//     res.json({
//       success: true,
//       order: orderData
//     });
//   } catch (error) {
//     console.error("❌ Get payment status error:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payment status",
//       error: error.response?.data || error.message
//     });
//   }
// };

// // Cashfree webhook handler
// export const handleWebhook = async (req, res) => {
//   try {
//     const webhookData = req.body;
//     console.log("🔔 Cashfree webhook received:", webhookData);

//     const { orderId, paymentStatus, transactionId } = webhookData;

//     // Update order status based on webhook
//     if (orderId) {
//       const order = await Order.findOne({ cashfreeOrderId: orderId });
//       if (order) {
//         order.paymentStatus = paymentStatus === 'SUCCESS' ? 'completed' : 'failed';
//         if (transactionId) {
//           order.cashfreePaymentId = transactionId;
//         }
//         await order.save();
//         console.log(`✅ Order ${orderId} updated to ${paymentStatus}`);
//       }
//     }

//     res.status(200).json({ success: true, message: "Webhook processed" });
//   } catch (error) {
//     console.error("❌ Webhook processing error:", error);
//     res.status(500).json({ success: false, message: "Webhook processing failed" });
//   }
// };

// // Test endpoint to check Cashfree configuration
// export const testCashfreeConfig = async (req, res) => {
//   try {
//     console.log('🧪 Testing Cashfree configuration...');
    
//     const configCheck = checkCashfreeConfig();
    
//     if (!configCheck) {
//       return res.status(500).json({
//         success: false,
//         message: "Configuration check failed",
//         environment: CASHFREE_CONFIG.environment,
//         baseURL: CASHFREE_CONFIG.baseURL,
//         hasAppId: !!CASHFREE_CONFIG.appId,
//         hasSecretKey: !!CASHFREE_CONFIG.secretKey
//       });
//     }

//     // Try a simple API call to verify credentials
//     const testResponse = await axios.get(
//       `${CASHFREE_CONFIG.baseURL}/orders`,
//       {
//         headers: {
//           'x-client-id': CASHFREE_CONFIG.appId,
//           'x-client-secret': CASHFREE_CONFIG.secretKey,
//           'x-api-version': '2022-09-01'
//         },
//         timeout: 10000
//       }
//     );

//     res.json({
//       success: true,
//       message: "Cashfree configuration is working",
//       environment: CASHFREE_CONFIG.environment,
//       baseURL: CASHFREE_CONFIG.baseURL,
//       testResponse: testResponse.data
//     });

//   } catch (error) {
//     console.error("❌ Cashfree test failed:", error.response?.data || error.message);
    
//     res.status(500).json({
//       success: false,
//       message: "Cashfree test failed",
//       error: error.response?.data || error.message,
//       environment: CASHFREE_CONFIG.environment,
//       baseURL: CASHFREE_CONFIG.baseURL,
//       debug: {
//         appId: CASHFREE_CONFIG.appId,
//         hasSecretKey: !!CASHFREE_CONFIG.secretKey
//       }
//     });
//   }
// };



// In createCashfreeOrder function, change this line:
// order_meta: {
//   return_url: `https://webhook.site/1024d82a-c689-4374-bf87-46658b15482c?order_id=${cfOrderId}`
// }

// // Updated orderData object:
// const orderData = {
//   order_id: cfOrderId,
//   order_amount: amount,
//   order_currency: currency,
//   customer_details: {
//     customer_id: userId.toString(),
//     customer_name: customerDetails?.customer_name || 'Test Customer',
//     customer_email: customerDetails?.customer_email || 'test@example.com',
//     customer_phone: customerDetails?.customer_phone || '9876543210'
//   },
//   order_meta: {
//     return_url: `https://webhook.site/1024d82a-c689-4374-bf87-46658b15482c?order_id=${cfOrderId}`
//   }
// };

// Complete updated payment controller:import axios from 'axios';
import axios from 'axios';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// ✅ SECURE: All credentials from environment variables
const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  environment: process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION',
  baseURL: process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' 
    ? "https://api.cashfree.com/pg" 
    : "https://sandbox.cashfree.com/pg"
};

console.log('=== CASHFREE PAYMENT CONTROLLER LOADED ===');
console.log('✅ Using Cashfree Gateway');
console.log('🔗 Base URL:', CASHFREE_CONFIG.baseURL);
console.log('🔐 Environment:', CASHFREE_CONFIG.environment);

// Debug function to check configuration
const checkCashfreeConfig = () => {
  if (!CASHFREE_CONFIG.appId || !CASHFREE_CONFIG.secretKey) {
    console.error('❌ MISSING: Cashfree credentials not found in environment variables');
    return false;
  }
  
  if (CASHFREE_CONFIG.appId.includes('YOUR_') || CASHFREE_CONFIG.secretKey.includes('YOUR_')) {
    console.error('❌ INVALID: Using placeholder credentials');
    return false;
  }
  
  console.log('✅ Cashfree configuration loaded from environment variables');
  return true;
};

// Test endpoint
export const testRoute = async (req, res) => {
  console.log('✅ TEST ROUTE CALLED - Cashfree Payment controller is working');
  res.json({
    success: true,
    message: 'Cashfree Payment controller is working!',
    config: {
      environment: CASHFREE_CONFIG.environment,
      baseURL: CASHFREE_CONFIG.baseURL,
      configStatus: 'Loaded from environment variables'
    }
  });
};

// Create Cashfree order - SECURE VERSION
export const createCashfreeOrder = async (req, res) => {
  try {
    console.log('=== CREATE CASHFREE ORDER CALLED ===');
    
    // ✅ Verify configuration
    if (!checkCashfreeConfig()) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error - Check environment variables"
      });
    }

    const userId = req.userId;
    const { amount, currency = 'INR', customerDetails } = req.body;

    console.log("💰 Creating Cashfree order for amount:", amount);

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Generate unique order ID for Cashfree
    const cfOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ✅ Secure order data structure
    const orderData = {
      order_id: cfOrderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: userId.toString(),
        customer_name: customerDetails?.customer_name || 'Customer',
        customer_email: customerDetails?.customer_email || 'customer@example.com',
        customer_phone: customerDetails?.customer_phone || '9999999999'
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL || 'https://saikrupapaithani-3.onrender.com'}/checkout.html?order_id=${cfOrderId}`
      }
    };

    console.log("📦 Cashfree order data prepared");

    // ✅ Secure headers using environment variables
    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CONFIG.appId,
      'x-client-secret': CASHFREE_CONFIG.secretKey,
      'x-api-version': '2022-09-01'
    };

    console.log("🔐 Making request to Cashfree API");

    // ✅ Make secure request to CASHFREE API
    const response = await axios.post(
      `${CASHFREE_CONFIG.baseURL}/orders`,
      orderData,
      { 
        headers,
        timeout: 15000
      }
    );

    console.log("✅ Cashfree API response received");

    // ✅ Extract payment_session_id from Cashfree response
    const cashfreeResponse = response.data;
    
    if (!cashfreeResponse.payment_session_id) {
      console.error("❌ Cashfree response missing payment_session_id");
      throw new Error('Cashfree did not return payment_session_id');
    }

    // ✅ Return secure response structure
    res.json({
      success: true,
      order: {
        order_id: cashfreeResponse.order_id,
        payment_session_id: cashfreeResponse.payment_session_id,
        order_amount: cashfreeResponse.order_amount,
        order_currency: cashfreeResponse.order_currency,
        order_status: cashfreeResponse.order_status
      },
      environment: CASHFREE_CONFIG.environment
    });

  } catch (error) {
    console.error("❌ Cashfree order creation FAILED:");
    
    if (error.response) {
      console.error("📊 Error Response Status:", error.response.status);
      
      let userMessage = "Payment gateway error";
      if (error.response.status === 401) {
        userMessage = "Cashfree authentication failed. Please check your credentials.";
      } else if (error.response.status === 400) {
        userMessage = "Invalid request to Cashfree";
      } else if (error.response.status === 500) {
        userMessage = "Cashfree server error";
      }
      
      res.status(error.response.status).json({
        success: false,
        message: userMessage,
        error: "Payment gateway error occurred"
      });
    } else if (error.request) {
      console.error("❌ No response received from Cashfree API");
      res.status(503).json({
        success: false,
        message: "Cashfree is not responding. Please try again.",
        error: "Network error"
      });
    } else {
      console.error("❌ Setup error:", error.message);
      res.status(500).json({
        success: false,
        message: "Cashfree setup failed",
        error: error.message
      });
    }
  }
};

// Verify Cashfree payment
export const verifyPayment = async (req, res) => {
  try {
    const { order_id, orderData } = req.body;

    console.log("🔍 Verifying Cashfree payment for order:", order_id);

    if (!checkCashfreeConfig()) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error"
      });
    }

    const response = await axios.get(
      `${CASHFREE_CONFIG.baseURL}/orders/${order_id}/payments`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_CONFIG.appId,
          'x-client-secret': CASHFREE_CONFIG.secretKey,
          'x-api-version': '2022-09-01'
        }
      }
    );

    const payments = response.data;
    console.log("💰 Cashfree payment verification response received");

    if (!payments || payments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No payment found for this order"
      });
    }

    const payment = payments[0];
    const isPaymentSuccessful = payment.payment_status === 'SUCCESS';

    if (!isPaymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: `Payment ${payment.payment_status}`,
        paymentStatus: payment.payment_status
      });
    }

    console.log("✅ Cashfree payment verified successfully");

    // Create order in database if orderData is provided
    if (orderData) {
      const {
        shippingAddress,
        paymentMethod,
        shippingMethod,
        items
      } = orderData;

      // Calculate order totals
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      let shipping = 0;
      if (shippingMethod === 'express') shipping = 500;
      else if (shippingMethod === 'standard') shipping = 200;
      else if (shippingMethod === 'free') shipping = subtotal > 10000 ? 0 : 200;

      const tax = Math.round(subtotal * 0.02);
      const discount = subtotal > 5000 ? Math.round(subtotal * 0.1) : 0;
      const total = subtotal + shipping + tax - discount;

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
        paymentMethod: 'cashfree',
        paymentStatus: 'completed',
        cashfreeOrderId: order_id,
        cashfreePaymentId: payment.cf_payment_id,
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
        paymentId: payment.cf_payment_id
      });
    } else {
      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: payment.cf_payment_id
      });
    }

  } catch (error) {
    console.error("❌ Cashfree payment verification error:", error.message);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};

// Generate QR Code for UPI payments using Cashfree
export const generateQRCode = async (req, res) => {
  try {
    if (!checkCashfreeConfig()) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error"
      });
    }

    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Generate unique order ID for QR
    const qrOrderId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create Cashfree order for QR payment
    const orderData = {
      order_id: qrOrderId,
      order_amount: amount,
      order_currency: 'INR',
      order_note: 'UPI QR Payment for SaiKrupa Paithani'
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CONFIG.appId,
      'x-client-secret': CASHFREE_CONFIG.secretKey,
      'x-api-version': '2022-09-01'
    };

    const response = await axios.post(
      `${CASHFREE_CONFIG.baseURL}/orders`,
      orderData,
      { headers }
    );

    const cashfreeResponse = response.data;

    // QR code data
    const qrData = {
      orderId: qrOrderId,
      amount: amount,
      upiId: 'rahulbhandge@ybl',
      qrString: `upi://pay?pa=test@cashfree&pn=SaiKrupa%20Paithani&am=${amount}&cu=INR`,
      note: 'Scan this QR code with any UPI app to pay',
      cashfreeOrder: cashfreeResponse
    };

    res.json({
      success: true,
      qrData: qrData,
      amount: amount,
      environment: CASHFREE_CONFIG.environment
    });

  } catch (error) {
    console.error("❌ Cashfree QR code generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR code",
      error: error.message
    });
  }
};

// Get payment status from Cashfree
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!checkCashfreeConfig()) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error"
      });
    }

    const response = await axios.get(
      `${CASHFREE_CONFIG.baseURL}/orders/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_CONFIG.appId,
          'x-client-secret': CASHFREE_CONFIG.secretKey,
          'x-api-version': '2022-09-01'
        }
      }
    );

    const orderData = response.data;
    
    res.json({
      success: true,
      order: orderData
    });
  } catch (error) {
    console.error("❌ Get Cashfree payment status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment status",
      error: error.message
    });
  }
};

// Cashfree webhook handler
export const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log("🔔 Cashfree webhook received");

    const { orderId, paymentStatus, transactionId } = webhookData;

    // Update order status based on webhook
    if (orderId) {
      const order = await Order.findOne({ cashfreeOrderId: orderId });
      if (order) {
        order.paymentStatus = paymentStatus === 'SUCCESS' ? 'completed' : 'failed';
        if (transactionId) {
          order.cashfreePaymentId = transactionId;
        }
        await order.save();
        console.log(`✅ Order ${orderId} updated to ${paymentStatus}`);
      }
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Cashfree webhook processing error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

// Test endpoint to check Cashfree configuration
export const testCashfreeConfig = async (req, res) => {
  try {
    console.log('🧪 Testing Cashfree configuration...');
    
    const configCheck = checkCashfreeConfig();
    
    if (!configCheck) {
      return res.status(500).json({
        success: false,
        message: "Configuration check failed",
        environment: CASHFREE_CONFIG.environment,
        baseURL: CASHFREE_CONFIG.baseURL,
        hasAppId: !!CASHFREE_CONFIG.appId,
        hasSecretKey: !!CASHFREE_CONFIG.secretKey
      });
    }

    // Try a simple API call to verify credentials
    const testResponse = await axios.get(
      `${CASHFREE_CONFIG.baseURL}/orders`,
      {
        headers: {
          'x-client-id': CASHFREE_CONFIG.appId,
          'x-client-secret': CASHFREE_CONFIG.secretKey,
          'x-api-version': '2022-09-01'
        },
        timeout: 10000
      }
    );

    res.json({
      success: true,
      message: "Cashfree configuration is working",
      environment: CASHFREE_CONFIG.environment,
      baseURL: CASHFREE_CONFIG.baseURL,
      testResponse: "API connection successful"
    });

  } catch (error) {
    console.error("❌ Cashfree test failed:", error.message);
    
    res.status(500).json({
      success: false,
      message: "Cashfree test failed",
      error: error.message,
      environment: CASHFREE_CONFIG.environment,
      baseURL: CASHFREE_CONFIG.baseURL
    });
  }
};

// Refund payment through Cashfree
export const initiateRefund = async (req, res) => {
  try {
    const { orderId, refundAmount, refundNote } = req.body;

    if (!checkCashfreeConfig()) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error"
      });
    }

    const refundData = {
      refund_amount: refundAmount,
      refund_note: refundNote || 'Refund initiated by merchant'
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CONFIG.appId,
      'x-client-secret': CASHFREE_CONFIG.secretKey,
      'x-api-version': '2022-09-01'
    };

    const response = await axios.post(
      `${CASHFREE_CONFIG.baseURL}/orders/${orderId}/refunds`,
      refundData,
      { headers }
    );

    const refundResponse = response.data;

    // Update order refund status in database
    await Order.findOneAndUpdate(
      { cashfreeOrderId: orderId },
      { 
        refundStatus: 'processed',
        paymentStatus: 'refunded'
      }
    );

    res.json({
      success: true,
      message: "Refund initiated successfully",
      refund: refundResponse
    });

  } catch (error) {
    console.error("❌ Cashfree refund initiation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to initiate refund",
      error: error.message
    });
  }
};

// Get order details from Cashfree
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!checkCashfreeConfig()) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error"
      });
    }

    const response = await axios.get(
      `${CASHFREE_CONFIG.baseURL}/orders/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_CONFIG.appId,
          'x-client-secret': CASHFREE_CONFIG.secretKey,
          'x-api-version': '2022-09-01'
        }
      }
    );

    const orderDetails = response.data;
    
    res.json({
      success: true,
      order: orderDetails
    });
  } catch (error) {
    console.error("❌ Get Cashfree order details error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message
    });
  }
};