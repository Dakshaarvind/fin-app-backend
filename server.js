const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Other Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// More Specific Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Handle JSON parsing errors (e.g., invalid JSON in request body)
    return res.status(400).json({ message: 'Invalid JSON format' });
  }

  if (err.name === 'UnauthorizedError') {
    // Handle JWT authentication errors (if you're using express-jwt)
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Default error response
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});