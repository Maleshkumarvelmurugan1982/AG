// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

// -------------------- MIDDLEWARE --------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ag-y9xh.onrender.com", // ✅ frontend hosted on Render
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

// -------------------- SERVE STATIC FILES --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- MONGODB CONNECTION --------------------
const MONGO_URL =
  process.env.MONGODB_URL ||
  "mongodb://127.0.0.1:27017/sivajothi";

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------- MULTER SETUP --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// -------------------- ROUTERS --------------------
const farmerRouter = require("./routes/farmers");
const sellerRouter = require("./routes/sellers");
const deliverymanRouter = require("./routes/deliveryman");

const productRouter = require("./routes/products");
const farmerProductRouter = require("./routes/farmerProducts");
const sellerOrderRouter = require("./routes/sellerOrders");
const farmerOrderRouter = require("./routes/farmerOrders");
const deliveryPostRouter = require("./routes/deliveryposts");
const schemesRouter = require("./routes/schemes");
const userRouter = require("./routes/user");
const deliverymenRouter = require("./routes/DeliveryMen");
const authRouter = require("./routes/auth");
const deliverymenAuthRouter = require("./routes/deliverymenAuth");

// -------------------- USE ROUTERS (PREFIXED WITH /api) --------------------
// ✅ Always prefix with /api to avoid conflict with frontend routes
app.use("/api/farmer", farmerRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/deliveryman", deliverymanRouter);
app.use("/api/product", productRouter);
app.use("/api/farmerProducts", farmerProductRouter);
app.use("/api/sellerorder", sellerOrderRouter);
app.use("/api/farmerorder", farmerOrderRouter);
app.use("/api/deliverypost", deliveryPostRouter);
app.use("/api/schemes", schemesRouter);
app.use("/api/user", userRouter);
app.use("/api/deliverymen", deliverymenRouter);
app.use("/api/auth", authRouter);
app.use("/api/deliverymenAuth", deliverymenAuthRouter);

// -------------------- PRODUCT EXTRA ROUTES --------------------
const Product = require("./model/Product");

// Add new vegetable product
app.post("/api/product/add", upload.single("productImage"), async (req, res) => {
  try {
    const { productName, category, quantity, price } = req.body;
    const productImage = req.file ? `/uploads/${req.file.filename}` : "";

    const newProduct = new Product({
      productName,
      category,
      quantity: Number(quantity),
      price: Number(price),
      productImage,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get products by category
app.get("/api/product/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update product quantity and price
app.patch("/api/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { quantity: Number(quantity), price: Number(price) },
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- DELIVERYMEN SALARY UPDATE --------------------
const DeliveryMen = require("./model/DeliveryMen");

app.put("/api/deliverymen/:id/salary", async (req, res) => {
  try {
    const { id } = req.params;
    const { salary } = req.body;

    const updatedDeliveryMan = await DeliveryMen.findByIdAndUpdate(
      id,
      { salary: Number(salary) },
      { new: true }
    );

    if (!updatedDeliveryMan)
      return res.status(404).json({ message: "Deliveryman not found" });

    res.json(updatedDeliveryMan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- DEPLOYMENT HANDLER --------------------
// ✅ When deploying to Render, serve frontend build too
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
