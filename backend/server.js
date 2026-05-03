const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Stripe = require("stripe");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// DB Connect
connectDB();

// ---------------- RATE LIMIT ----------------
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

// ---------------- CORS (FIXED ✅) ----------------
const allowedOrigins = [
  "https://prodesk-capstone-task-matrix.vercel.app/" 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS Blocked:", origin);
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
  })
);

// ---------------- MIDDLEWARE ----------------
app.use(express.json());

// ---------------- STRIPE ----------------
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ---------------- ROUTES ----------------
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// ---------------- PAYMENT ----------------
app.post("/api/payment/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ msg: "Stripe not configured" });

    const clientURL = process.env.CLIENT_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "TaskMatrix Pro" },
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

// ---------------- HEALTH CHECK (NEW ✅) ----------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TaskMatrix backend is live 🚀",
  });
});

// ---------------- ROOT ----------------
app.get("/", (req, res) => {
  res.send("TaskMatrix API is Running Fine!");
});

// ---------------- 404 ----------------
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);
  res.status(500).json({
    msg: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? null : err.message,
  });
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});