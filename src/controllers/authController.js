const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/authUtils');

const authController = {
    async register(req, res) {
        console.log('[/register] Request received:', req.body);
        try {
            const { email, password, phone } = req.body;

            // Basic validation (you'll need more robust validation in a real app)
            if (!email || !password || !phone) {
                console.log('[/register] Validation failed: Missing fields')
                return res.status(400).json({ message: 'Email, password, and phone are required' });
            }
            //check if user with that email already exists
            console.log('[/register] Checking for existing user with email:', email);
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                console.log('[/register] User already exists:', email);
              return res.status(400).json({ message: 'User with that email already exists' });
            }

            console.log('[/register] Hashing password');
            const hashedPassword = await hashPassword(password);

            console.log('[/register] Creating user:', email);
            const user = await User.create(email, hashedPassword, phone);

            console.log('[/register] Creating JWT token for user ID:', user.id); 
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            console.log('[/register] Registration successful, returning token');
            res.status(201).json({ token });
        } catch (error) {
            console.error('[/register] Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};

module.exports = authController;