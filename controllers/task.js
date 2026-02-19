const mongoose = require('mongoose');
const Task = require('../models/tasks');
const Subtask = require('../models/subtask');

const getTasks = async (req, res) => {
    try {
        // pagination stuff
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        
        // sorting stuff
        const sort = {};
        sort[sortBy] = sortOrder;

        const skip = (page - 1) * limit;
        const tasks = await Task.find()
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const taskIds = tasks.map(task => task._id);
        const subtasks = await Subtask.find({ taskId: { $in: taskIds } });

        const subtasksByTaskId = {};
        subtasks.forEach(subtask => {
            if (!subtasksByTaskId[subtask.taskId]) {
                subtasksByTaskId[subtask.taskId] = [];
            }
            subtasksByTaskId[subtask.taskId].push(subtask);
        });

        const tasksWithSubtasks = tasks.map(task => {
            return {
                ...task.toObject(),
                subtasks: subtasksByTaskId[task._id] || []
            };
        });

        const totalTasks = await Task.countDocuments();

        res.status(200).json({
            tasks: tasksWithSubtasks,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks: totalTasks,
                hasNextPage: page < Math.ceil(totalTasks / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTask = async (req, res) => {
    const { title, description, status, priority, createdById, taskId } = req.body;
    let dueDate = new Date(req.body.dueDate);

    if(!title || !description || !createdById || !dueDate)
        return res.status(400).json({ error: 'All fields are required' });

    if (isNaN(dueDate.getTime())) {
        return res.status(400).json({ error: 'Due date must be a valid date' });
    }

    if(taskId){
        const parentTask = await Task.findById(taskId);
        if(!parentTask)
            return res.status(404).json({ error: 'Parent task not found' });

        const task = await Subtask.create({taskId, title, description, status, priority, createdById, dueDate });
        if(!task)
            return res.status(400).json({ error: 'Failed to create subtask' });

        return res.status(201).json(task);
    }

    const task = await Task.create({ title, description, status, priority, createdById, dueDate });
    if(!task)
        return res.status(400).json({ error: 'Failed to create task' });

    res.status(201).json(task);
};

const updateTask = async (req, res) => {
    const { title, description, status, priority, dueDate, taskId } = req.body;
    if(taskId) {
        const task = await Subtask.findByIdAndUpdate(req.params.id, { title, description, status, priority, dueDate, taskId }, { new: true });
        if(!task)
            return res.status(404).json({ error: 'Subtask not found' });
        
        return res.status(200).json(task);
    }

    const task = await Task.findByIdAndUpdate(req.params.id, { title, description, status, priority, dueDate }, { new: true });
    if(!task)
        return res.status(404).json({ error: 'Task not found' });
    
    res.status(200).json(task);
};

module.exports = { getTasks, createTask, updateTask };

