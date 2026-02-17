const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');

// Route files
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const groupRoutes = require('./routes/groupRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const interactionRoutes = require('./routes/interactionRoutes');

// Load env vars
dotenv.config();

// Connect to database
// connectDB(); // Moved to startup

// Start Worker
require('./services/WorkerService').start();

const app = express();
const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const dirs = [
    path.join(__dirname, 'uploads', 'books'),
    path.join(__dirname, 'uploads', 'covers')
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: ["https://inkvero.vercel.app", "http://localhost:5173", "http://localhost:5174", clientUrl, /\.vercel\.app$/], // Allow Vercel previews
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static book covers
app.use('/book-covers', express.static(path.join(__dirname, 'public/book-covers')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/profile', userProfileRoutes);
app.use('/api/v1/interactions', interactionRoutes);
app.use('/api/v1/my-books', require('./routes/userUploadedBookRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

// Health check
app.get('/', (req, res) => {
    console.log('Health check hit');
    res.status(200).json({ status: 'success', message: 'Inkvero API is running' });
});

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 404 Handler
// app.all('*', (req, res, next) => {
//     next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404, 'RESOURCE_NOT_FOUND'));
// });

// Global Error Handler
// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});
