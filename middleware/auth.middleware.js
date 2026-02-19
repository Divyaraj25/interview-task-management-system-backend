const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        data: null, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request object
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        data: null, 
        message: 'Token is not valid' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      data: null, 
      message: 'Token is not valid' 
    });
  }
};

const checkUserByRole = (allowedRoles) => {
    return (req, res, next) => {
      console.log('Allowed Roles:', allowedRoles);
      console.log('User Role:', req.user.role);
      if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
              success: false, 
              data: null, 
              message: 'Forbidden' 
            });
        }
        next();
    };
};

module.exports = {authMiddleware, checkUserByRole};
