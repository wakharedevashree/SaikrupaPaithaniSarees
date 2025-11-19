// import express from "express";
// import { 
//   createRazorpayOrder, 
//   verifyPayment, 
//   generateQRCode,
//   getPaymentStatus 
// } from "../controllers/paymentController.js";
// import { authenticate } from "../middleware/auth.js";

// const router = express.Router();

// // All payment routes are protected
// router.post("/create-order", authenticate, createRazorpayOrder);
// router.post("/verify", authenticate, verifyPayment);
// router.post("/generate-qr", authenticate, generateQRCode);
// router.get("/status/:orderId", authenticate, getPaymentStatus);

// export default router;

import express from "express";
import { 
  createRazorpayOrder, 
  verifyPayment, 
  generateQRCode,
  getPaymentStatus,
  verifyUPIPayment  // ADD THIS
} from "../controllers/paymentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All payment routes are protected
router.post("/create-order", authenticate, createRazorpayOrder);
router.post("/verify-payment", authenticate, verifyPayment);
router.post("/generate-qr", authenticate, generateQRCode);
router.post("/verify-upi", authenticate, verifyUPIPayment); // ADD THIS ROUTE
router.get("/status/:orderId", authenticate, getPaymentStatus);

export default router;

