const express = require('express');
const router = express.Router();
// const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/task');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/task');
const { checkUserByRole } = require('../middleware/auth.middleware');

router.get('/', checkUserByRole(['viewer', 'editor', 'admin']) , getTasks);
router.post('/', checkUserByRole(['editor', 'admin']) , createTask);
router.put('/:id', checkUserByRole(['editor', 'admin']) , updateTask);
router.delete('/:id', checkUserByRole(['admin']) , deleteTask);

module.exports = router;
