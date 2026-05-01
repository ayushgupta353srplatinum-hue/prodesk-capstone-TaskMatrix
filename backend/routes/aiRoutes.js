const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/suggest", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Give short steps for: ${title}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data.choices[0].message.content;

    res.json({ success: true, data: text });

  } catch (error) {
    console.error("AI ERROR FULL:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "AI failed",
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;