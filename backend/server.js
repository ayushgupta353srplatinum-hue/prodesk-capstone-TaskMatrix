const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Stripe = require("stripe");

dotenv.config();
const app = express();

// DB Connection
connectDB();

// --- ULTIMATE CORS FIX (Express 5+ Friendly) ---
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Browser ke pre-flight (OPTIONS) request ko handle karne ka safe tarika
// Isse "PathError" nahi aayega
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// STRIPE INITIALIZATION
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// PAYMENT ROUTE
app.post("/api/payment/create-checkout-session", async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ msg: "Stripe Key missing in .env" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { name: "TaskMatrix Pro 🚀" },
          unit_amount: 50000, 
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`
    });

// server.js ke payment route mein aakhiri line badal do
res.json({ url: session.url }); // id ki jagah url bhejo
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ msg: err.message || "Payment session failed" });
  }
});

app.get("/", (req, res) => res.send("API Running 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));