const express = require("express");
const rateLimit = require("express-rate-limit");
const fetch = require("node-fetch");

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many AI requests, slow down!" }
});

router.post("/suggest", aiLimiter, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Title must be at least 3 characters"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are an API.
Return ONLY valid JSON.

Format:
{
  "steps": ["Step 1", "Step 2", "Step 3"]
}
            `
          },
          {
            role: "user",
            content: `Task: ${title}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: "AI failed",
        message: data
      });
    }

    let text = data.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid format"
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      data: parsed.steps
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message
    });
  }
});

module.exports = router;