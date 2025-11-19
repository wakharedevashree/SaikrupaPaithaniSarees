


// import express from "express";
// import { 
//   createOrder, 
//   getUserOrders, 
//   getOrderById, 
//   getAllOrders,
//   updateOrderStatus,
//   deleteOrder,
//   updatePaymentStatus,
//   updateDeliveryDate,
//  // ADD THIS IMPORT
// } from "../controllers/orderController.js";
// import { authenticate } from "../middleware/auth.js";


// const router = express.Router();

// // All routes are protected
// router.post("/create", authenticate, createOrder);
// router.get("/user-orders", authenticate, getUserOrders);
// router.get("/all-orders", authenticate, getAllOrders);
// router.put("/:orderId/status", authenticate, updateOrderStatus);
// router.put("/:orderId/delivery-date", authenticate, updateDeliveryDate); // ADD THIS LINE
// router.put("/:orderId/payment-status", authenticate, updatePaymentStatus);
// router.delete("/:orderId", authenticate, deleteOrder);
// router.get("/:orderId", authenticate, getOrderById);


// export default router;


import express from "express";
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,
  updateDeliveryDate,
  requestReturn,
  updateReturnStatus
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.post("/create", authenticate, createOrder);
router.get("/user-orders", authenticate, getUserOrders);
router.get("/all-orders", authenticate, getAllOrders);
router.put("/:orderId/status", authenticate, updateOrderStatus);
router.put("/:orderId/delivery-date", authenticate, updateDeliveryDate);
router.put("/:orderId/payment-status", authenticate, updatePaymentStatus);
router.delete("/:orderId", authenticate, deleteOrder);
router.get("/:orderId", authenticate, getOrderById);

// Return routes
router.post("/:orderId/return", authenticate, requestReturn);
router.put("/:orderId/return-status", authenticate, updateReturnStatus);

export default router;