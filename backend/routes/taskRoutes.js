const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE
router.post("/", authMiddleware, async (req, res) => {
  const task = await Task.create({
    title: req.body.title,
    status: req.body.status || "todo",
    priority: req.body.priority || "low",
    userId: req.user.id
  });

  res.json(task);
});

// READ
router.get("/", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

// UPDATE
router.put("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task || task.userId.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Not allowed" });
  }

  task.title = req.body.title ?? task.title;
  task.status = req.body.status ?? task.status;
  task.priority = req.body.priority ?? task.priority;

  await task.save();

  res.json(task);
});

// DELETE
router.delete("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task || task.userId.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Not allowed" });
  }

  await task.deleteOne();
  res.json({ msg: "Deleted" });
});

module.exports = router;