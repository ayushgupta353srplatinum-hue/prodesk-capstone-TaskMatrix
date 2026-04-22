const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["todo", "progress", "done"],
    default: "todo"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);