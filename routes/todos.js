const Todo = require("../models/ToDo");
const express = require("express");
const router = express.Router();
const { validationResult, body, param } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

//route to get all tasks from database
router.get("/todos", requireAuth, async (req, res) => {
  try {
    const todos = await Todo.find();

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// route to add new tasks
router.post(
  "/todos",
  requireAuth,
  [
    body("name").isLength({ min: 1 }).trim().escape(),
    body("description").isLength({ min: 1 }).trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newTodoData = req.body;
      // console.log("newTodoData: ", newTodoData);
      const newTodo = new Todo(newTodoData);
      await newTodo.save();
      res.json(newTodo);
      // console.log(newTodoData);
    } catch (error) {
      res.status(500).json({ error: "Error creating todo" });
    }
  }
);

// route to update existing task
router.put(
  "/todos/:id",
  requireAuth,
  [
    param("id").isMongoId().withMessage("Invalid todo ID"),
    body("name").isLength({ min: 3 }).trim().escape(),
    body("description").isLength({ min: 3 }).trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const id = req.params.id;
      const updatedTodoData = req.body;
      const updatedTodo = await Todo.findByIdAndUpdate(id, updatedTodoData, {
        new: true,
      });
      if (!updatedTodo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(updatedTodo);
    } catch (error) {
      res.status(500).json({ error: "Error updating todo" });
    }
  }
);

// done & undone
router.put("/todos/status/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  try {
    const taskToUpdate = await Todo.findById(id);

    if (!taskToUpdate) {
      return res.status(404).json({ error: "Task not found" });
    }

    taskToUpdate.completed = !taskToUpdate.completed;
    await taskToUpdate.save();
    const updatedTask = taskToUpdate.toObject();

    res.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal server error : " + error.message });
  }
});

router.delete("/todos/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    await Todo.findByIdAndRemove(id);
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting todo" });
  }
});

module.exports = router;
