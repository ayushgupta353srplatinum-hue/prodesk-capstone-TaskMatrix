const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// 1. CREATE TASK (POST)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, status, priority } = req.body;
    const newTask = new Task({
      title,
      status,
      priority,
      userId: req.user.id // Token se user ID mil rahi hai
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: "Task create nahi ho paya" });
  }
});

// 2. READ ALL TASKS OF LOGGED-IN USER (GET)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Tasks fetch nahi ho paye" });
  }
});

// 3. UPDATE TASK (PUT)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Check ownership: Kya ye task isi user ka hai?
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 4. DELETE TASK (DELETE)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;