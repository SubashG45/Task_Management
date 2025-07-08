const Task = require('../models/Tasks');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Parser } = require('json2csv');

// Create task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all tasks with filters & search
exports.getTasks = async (req, res) => {
  const { status, priority, search } = req.query;
  const query = { userId: req.user.id };

  if (status === 'completed') query.completed = true;
  else if (status === 'pending') query.completed = false;

  if (priority) query.priority = priority;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export to CSV
exports.exportTasks = async (req, res) => {
  try {
    // Fetch user's tasks
    const tasks = await Task.find({ userId: req.user.id }).lean(); // lean() for plain objects

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found to export.' });
    }

    // Define CSV fields
    const fields = ['title', 'description', 'priority', 'dueDate', 'completed'];
    const opts = { fields };

    // Convert to CSV string
    const parser = new Parser(opts);
    const csv = parser.parse(tasks);

    // Send CSV as a downloadable file
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=tasks.csv');
    res.status(200).send(csv);
  } catch (err) {
    console.error('Error exporting tasks:', err);
    res.status(500).json({ error: 'Failed to export tasks' });
  }
};
