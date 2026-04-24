const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Stripe = require("stripe");

dotenv.config();
const app = express();

// DB Connection
connectDB();

// --- FIXED CORS SETUP ---
app.use(cors({
  origin: "http://localhost:5173", // Specific origin rakho
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Pre-flight fix
app.options('*', cors()); 

app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.post("/api/payment/create-checkout-session", async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ msg: "Stripe Key missing in .env" });
    }

    // Yahan ensure karo ki URL ekdum clean ho
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { name: "TaskMatrix Pro" },
          unit_amount: 50000, 
        },
        quantity: 1
      }],
      mode: "payment",
      // Forcefully adding http if missing
      success_url: `${clientURL}/success`,
      cancel_url: `${clientURL}/dashboard`
    });

    console.log("Stripe Session Created: ", session.id);
    res.json({ url: session.url }); 
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ msg: err.message || "Payment session failed" });
  }
});

app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));