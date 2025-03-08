const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const memecoinRoutes = require('./routes/memecoinRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/memecoin', memecoinRoutes);

module.exports = app;