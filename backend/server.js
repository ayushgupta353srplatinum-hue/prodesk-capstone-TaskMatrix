const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Stripe = require("stripe");

dotenv.config();
const app = express();

// 1. Database Connection
connectDB();

// 2. --- DEPLOYMENT READY CORS SETUP ---
// Localhost aur Vercel dono ko allow kar rahe hain
const allowedOrigins = [
  "http://localhost:5173",
  "https://prodesk-capstone-task-matrix.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Agar origin list mein hai ya local hai toh allow karo
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Blocked: This origin is not allowed by Ashmit's Server"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// 3. --- EXPRESS 5 COMPATIBILITY FIX ---
// Manual wildcard routes ko hata diya hai kyunki CORS middleware khud handle kar lega
// Ye line Express 5 ke 'PathError' ko hamesha ke liye khatam kar degi
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 4. --- ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// 5. --- PAYMENT ROUTE ---
app.post("/api/payment/create-checkout-session", async (req, res) => {
  try {
    // 1. Pehle check karo Render pe CLIENT_URL set hai ya nahi
    // Agar nahi hai toh fallback localhost pe jayega (only for local testing)
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";

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
      // Sabse zaroori: Ye URL browser ke URL se match hona chahiye
      success_url: `${clientURL}/success`,
      cancel_url: `${clientURL}/dashboard`
    });

    res.json({ url: session.url }); 
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});
app.get("/", (req, res) => res.send("TaskMatrix API is Running Fine! 🚀"));

// 6. --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
});