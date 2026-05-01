const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini Initialize
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/suggest", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  try {
    // 1. Model select (Flash is faster and free)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Give me a short, 1-sentence action plan to complete this task: "${title}". Just the steps, no extra talk.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, data: text });
  } catch (error) {
    console.error("Gemini Error Details:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "AI fail ho gaya!", 
      error: error.message // Isse hume Render logs mein asli wajah dikhegi
    });
  }
});

module.exports = router;