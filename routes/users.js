const express = require('express');
const router = express.Router();
const User = require('../models/users');
const { login, register } = require('../controllers/auth');

router.post('/login', login);
router.post('/register', register);

module.exports = router;
