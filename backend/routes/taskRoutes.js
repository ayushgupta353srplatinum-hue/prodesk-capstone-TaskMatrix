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
      status: status || "todo",
      priority: priority ? priority.toLowerCase() : "low", // lowercase fix
      userId: req.user.id
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Task Create Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. READ ALL TASKS (GET)
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
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const updateData = { ...req.body };
    if (updateData.priority) updateData.priority = updateData.priority.toLowerCase();

    task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
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