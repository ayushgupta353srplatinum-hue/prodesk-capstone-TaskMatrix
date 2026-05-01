const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini Initialize
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/suggest", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // AI ko instruct karna taki wo short steps de
    const prompt = `Give 3 very short actionable steps for the task: "${title}". Respond with only the steps, no extra talk.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      data: text,
    });

  } catch (err) {
    console.error("FINAL GEMINI ERROR:", err);
    res.status(500).json({
      error: "AI failed",
      message: err.message,
    });
  }
});

module.exports = router;