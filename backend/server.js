const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Stripe = require("stripe");
const rateLimit = require("express-rate-limit");

dotenv.config();

// Debugging ke liye (Sirf startup pe dikhega)
console.log("🚀 Server starting...");
console.log("AI KEY Status:", process.env.GEMINI_API_KEY ? "Found" : "Not Found");

const app = express();

// ✅ RENDER/VERCEL FIX: Rate limiting behind proxy
app.set("trust proxy", 1);

// ✅ DB CONNECT
connectDB();

// ✅ SECURITY: RATE LIMITERS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: "Too many requests, try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { msg: "Too many login attempts, slow down" },
});

app.use(globalLimiter);

// ✅ CORS FIX: Dono Vercel aur Render URLs ko allow karo
const allowedOrigins = [
  "http://localhost:5173",
  "https://prodesk-capstone-task-matrix.vercel.app",
  "https://prodesk-capstone-taskmatrix-2.onrender.com" // Tera backend URL bhi safe side add kar diya
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS Blocked for origin:", origin); // Debugging ke liye
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
  })
);

// ✅ BODY PARSER
app.use(express.json());

// ✅ STRIPE INIT
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// ---------------- ROUTES ----------------

// 🔐 AUTH
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

// 📋 TASKS
app.use("/api/tasks", require("./routes/taskRoutes"));

// 🤖 AI ROUTE (Gemini)
// Note: Make sure your aiRoutes.js file exists in the routes folder!
app.use("/api/ai", require("./routes/aiRoutes"));

// 💳 PAYMENT
app.post("/api/payment/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ msg: "Stripe not configured" });

    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "TaskMatrix Pro 🚀" },
            unit_amount: 50000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${clientURL}/success`,
      cancel_url: `${clientURL}/dashboard`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(400).json({ msg: "Stripe Error", error: err.message });
  }
});

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("TaskMatrix API is Running Fine! 🚀");
});

// ❌ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found - Check path carefully!" });
});

// 🧠 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({
    msg: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? null : err.message,
  });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});