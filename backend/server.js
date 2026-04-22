const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Stripe = require("stripe"); // Upar import karo

dotenv.config();
const app = express();

// DB Connection
connectDB();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// STRIPE INITIALIZATION (Ek hi baar)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// PAYMENT ROUTE (Fixed & Single)
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
          unit_amount: 50000, // ₹500.00
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ msg: err.message || "Payment session failed" });
  }
});

app.get("/", (req, res) => res.send("API Running 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));