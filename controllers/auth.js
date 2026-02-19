const mongoose = require('mongoose');
const User = require('../models/users');

const register = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password)
    return res.status(400).send('Email and password are required');
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).send('User already exists');
    
    await User.create({ email, password });
    
    res.status(201).send('Registration successful');
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password)
    return res.status(400).send('Email and password are required');
    
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).send('Invalid email or password or you have\'t signup your email');
    
    res.status(200).send('Login successful');
};

module.exports = {
    register,
    login
}