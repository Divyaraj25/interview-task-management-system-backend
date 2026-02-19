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
            success: true,
            data: {
                tasks: tasksWithSubtasks,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalTasks / limit),
                    totalTasks: totalTasks,
                    hasNextPage: page < Math.ceil(totalTasks / limit),
                    hasPrevPage: page > 1
                }
            },
            message: 'Tasks retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            data: null, 
            message: error.message 
        });
    }
};

const createTask = async (req, res) => {
    const { title, description, status, priority, createdById, taskId } = req.body;
    let dueDate = new Date(req.body.dueDate);

    if(!title || !description || !createdById || !dueDate)
        return res.status(400).json({ 
            success: false, 
            data: null, 
            message: 'All fields are required' 
        });

    if (isNaN(dueDate.getTime())) {
        return res.status(400).json({ 
            success: false, 
            data: null, 
            message: 'Due date must be a valid date' 
        });
    }

    if(taskId){
        const parentTask = await Task.findById(taskId);
        if(!parentTask)
            return res.status(404).json({ 
                success: false, 
                data: null, 
                message: 'Parent task not found' 
            });

        const task = await Subtask.create({taskId, title, description, status, priority, createdById, dueDate });
        if(!task)
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: 'Failed to create subtask' 
            });

        return res.status(201).json({
            success: true,
            data: task,
            message: 'Subtask created successfully'
        });
    }

    const task = await Task.create({ title, description, status, priority, createdById, dueDate });
    if(!task)
        return res.status(400).json({ 
            success: false, 
            data: null, 
            message: 'Failed to create task' 
        });

    res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
    });
};

const updateTask = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { title, description, status, priority, dueDate, taskId } = req.body;
        let task;
        
        if(taskId) {
            task = await Subtask.findByIdAndUpdate(
                req.params.id, 
                { title, description, status, priority, dueDate, taskId }, 
                { new: true, session }
            );
            if(!task)
                return res.status(404).json({ 
                    success: false, 
                    data: null, 
                    message: 'Subtask not found' 
                });
        } else {
            task = await Task.findByIdAndUpdate(
                req.params.id, 
                { title, description, status, priority, dueDate }, 
                { new: true, session }
            );
            if(!task)
                return res.status(404).json({ 
                    success: false, 
                    data: null, 
                    message: 'Task not found' 
                });
        }

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            data: task,
            message: 'Task updated successfully'
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ 
            success: false, 
            data: null, 
            message: error.message 
        });
    } finally {
        session.endSession();
    }
};

const deleteTask = async (req, res) => {
    // first check if the task is a subtask or not,
    // if the task is subtask then delete that subtask, otherwise delete the main task and related subtasks
    if(req.body.subTask === true) {
        const task = await Subtask.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                data: null, 
                message: 'Subtask not found' 
            });
        }
    } else {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );
        
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                data: null, 
                message: 'Task not found' 
            });
        }

        // Also mark all subtasks as deleted, as per task flow, it is stated that if main task deleted then all subtask should be deleted
        await Subtask.updateMany(
            { taskId: req.params.id },
            { deleted: true }
        );
        res.status(200).json({ 
            success: true, 
            data: { task }, 
            message: 'Task marked as deleted successfully' 
        });
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };

