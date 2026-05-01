const express = require("express");
const router = express.Router();

router.post("/suggest", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // free/cheap model
        messages: [
          {
            role: "user",
            content: `Give 2-3 short steps to complete this task: ${title}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("OPENROUTER ERROR:", data);
      return res.status(500).json({ error: "AI failed", message: data });
    }

    const text = data.choices[0].message.content;

    res.json({ success: true, data: text });

  } catch (err) {
    console.log("FINAL ERROR:", err);
    res.status(500).json({
      error: "AI failed",
      message: err.message
    });
  }
});

module.exports = router;