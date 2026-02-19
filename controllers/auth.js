const mongoose = require('mongoose');
const User = require('../models/users');

const register = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password)
    return res.status(400).json({ 
        success: false, 
        data: null, 
        message: 'Email and password are required' 
    });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ 
        success: false, 
        data: null, 
        message: 'User already exists' 
    });
    
    const user = await User.create({ email, password });

    const token = user.generateToken();
    
    res.status(201).json({ 
        success: true, 
        data: { token }, 
        message: 'Registration successful' 
    });
};

const login = async (req, res) => { 
    const { email, password } = req.body;
    if(!email || !password)
    return res.status(400).json({ 
        success: false, 
        data: null, 
        message: 'Email and password are required' 
    });
    
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ 
        success: false, 
        data: null, 
        message: 'Invalid email or password or you haven\'t signed up with this email' 
    });
    const token = user.generateToken();
    res.status(200).json({ 
        success: true, 
        data: { token }, 
        message: 'Login successful' 
    });
};

module.exports = {
    register,
    login
}