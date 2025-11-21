// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// import connectDB from "./config/db.js";
// import authRoutes from "./routes/auth.js";
// import productRoutes from "./routes/product.js"; // ✅ newly added
// import cartRoutes from "./routes/cartRoutes.js";
// import { authenticate } from "./middleware/auth.js";
// import orderRoutes from './routes/orderRoutes.js';
// import reviewRoutes from './routes/reviewRoutes.js';
// import youtubeVideoRoutes from "./routes/youtubeVideoRoutes.js";
//  import paymentRoutes from './routes/paymentRoutes.js';
//  import emailRoutes from './routes/emailRoutes.js';

// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Serve frontend static files
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use(express.static(path.join(__dirname, "../frontend/pages")));
// app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// // Default route - serve homepage
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/pages/home1.html"));
// });
// app.get("/admin", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/pages/admin.html"));
// });

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes); // ✅ added product management routes
// app.use("/api/cart", authenticate, cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use("/api/youtube-videos", youtubeVideoRoutes);
//  app.use('/api/payments', paymentRoutes);
//  app.use('/api/email', emailRoutes);

// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/pages/home1.html"));
// });

// // 404 Fallback for unknown routes
// // app.use((req, res) => {
// //   res.status(404).sendFile(path.join(__dirname, "../frontend/pages/404.html"));
// // });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cartRoutes.js";
import { authenticate } from "./middleware/auth.js";
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import youtubeVideoRoutes from "./routes/youtubeVideoRoutes.js";
import paymentRoutes from './routes/paymentRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware - CORS first
app.use(cors({
    origin: [
        "https://saikrupapaithanisarees-mdqk.onrender.com",
        "http://localhost:3000",
        "http://localhost:5000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - multiple possible locations
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../frontend/pages")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", authenticate, cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/youtube-videos", youtubeVideoRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/email', emailRoutes);

// Test route to verify API is working
app.get("/api/test", (req, res) => {
    res.json({ 
        message: "API is working!", 
        timestamp: new Date().toISOString() 
    });
});

// Serve main pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/home1.html"));
});
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/signup.html"));
});
app.get("/dashboard1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/dashboard1.html"));
});
app.get("/orders1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/orders1.html"));
});

app.get("/admin1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/admin1.html"));
});

app.get("/youtube-admin1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/youtube-admin1.html"));
});
app.get("/cart1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/cart1.html"));
});
app.get("/description1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/description1.html"));
});
app.get("/checkout_page1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/checkout_page1.html"));
});
app.get("/confirmation1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/confirmation1.html"));
});
app.get("/history1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/history1.html"));
});
app.get("/product1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/product1.html"));
});
app.get("/reviews1", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/reviews1.html"));
});


// Health check route for Render
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        path: req.path 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({ 
        error: "Internal server error",
        message: err.message 
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
   // console.log(`📍 Health check: http://localhost:${PORT}/health`);
    
});

