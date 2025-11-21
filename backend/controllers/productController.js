



// import Product from "../models/Product.js";

// // Get all products
// export const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// export const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Add new product
// export const addProduct = async (req, res) => {
//   try {
//     const images = req.files ? req.files.map(file => file.path) : [];
//     const product = new Product({
//       ...req.body,
//       images
//     });
//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Update product ✅ (handle new images if uploaded)
// export const updateProduct = async (req, res) => {
//   try {
//     const updateData = { ...req.body };

//     if (req.files && req.files.length > 0) {
//       updateData.images = req.files.map(file => file.path);
//     }

//     const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!updated) return res.status(404).json({ message: "Product not found" });

//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Delete product
// export const deleteProduct = async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.json({ message: "Product deleted successfully" });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

import Product from "../models/Product.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new product - FOR MEMORY STORAGE + CLOUDINARY
export const addProduct = async (req, res) => {
  try {
    console.log("➕ Creating product with data:", req.body);
    
    // ✅ Images come from Cloudinary middleware in req.body.images
    const images = req.body.images || [];
    
    const product = new Product({
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      description: req.body.description || "",
      images: images // Cloudinary URLs from middleware
    });
    
    await product.save();
    console.log("✅ Product created successfully:", product._id);
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Add product error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Update product - FOR MEMORY STORAGE + CLOUDINARY
export const updateProduct = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      description: req.body.description || ""
    };

    // ✅ New images come from Cloudinary middleware in req.body.images
    if (req.body.images && req.body.images.length > 0) {
      updateData.images = req.body.images;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    console.log("✅ Product updated successfully:", updated._id);
    res.json(updated);
  } catch (err) {
    console.error("❌ Update product error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
