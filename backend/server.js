const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Stripe = require("stripe");

// ENV FIRST
dotenv.config();

// APP
const app = express();

// DB CONNECT
connectDB();

// STRIPE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(express.json());

// ROUTES IMPORT
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authMiddleware = require("./middleware/authMiddleware");

// ROUTES USE
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); // 👈 YE LINE MOST IMPORTANT

// PAYMENT
app.post("/api/payment", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { name: "TaskMatrix Pro 🚀" },
          unit_amount: 50000
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`
    });

    res.json({ id: session.id });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Payment error" });
  }
});

// TEST
app.get("/", (req, res) => {
  res.send("API Running");
});

// PROTECTED
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));