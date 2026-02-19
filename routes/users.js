const express = require('express');
const router = express.Router();
const User = require('../models/users');
const { login, register } = require('../controllers/auth');

router.get('/', function(req, res, next) {
  res.status(200).json({
    success: true,
    data: null,
    message: 'respond with a resource'
  });
});

router.post('/login', login);
router.post('/register', register);

module.exports = router;
