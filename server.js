const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const cors = require('cors');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const openBrowser = require('open');

require('dotenv').config();

const app = express();

// Database connection
const dbConnection = require('./src/config/database');

// Session store configuration
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: 86400000, // 24 hours
    createDatabaseTable: true
}, dbConnection);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'src/public')));

// View engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);


// Session configuration
app.use(session({
    key: 'auth_session',
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

// Authentication middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Vui lòng đăng nhập để tiếp tục');
    res.redirect('/auth/login');
};

const ensureGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
};

// API Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const passwordRoutes = require('./src/routes/password');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/password', passwordRoutes);

// Frontend Routes
// Auth routes
app.get('/auth/login', ensureGuest, (req, res) => {
    res.render('auth/login', {
        title: 'Đăng nhập',
        layout: './layouts/main'
    });
});

app.get('/auth/register', ensureGuest, (req, res) => {
    res.render('auth/register', {
        title: 'Đăng ký',
        layout: './layouts/main'
    });
});

app.get('/auth/forgot-password', ensureGuest, (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Quên mật khẩu',
        layout: './layouts/main'
    });
});

// User routes
app.get('/user/profile', ensureAuthenticated, (req, res) => {
    res.render('user/profile', {
        title: 'Thông tin cá nhân',
        layout: './layouts/main'
    });
});

// Home route
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Trang chủ',
        layout: './layouts/main'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    req.flash('error_msg', 'Có lỗi xảy ra từ phía server');
    res.status(500).render('errors/error', { 
        title: 'Lỗi Server',
        layout: './layouts/main'
    });
});
// // 404 handler
// app.use((req, res) => {
//     res.status(404).render('errors/404', {
//         title: 'Không tìm thấy trang',
//         layout: './layouts/main'
//     });
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.clear(); // Xóa console cũ
    console.log('\x1b[36m%s\x1b[0m', `
============================================
🚀 Server is running on port ${PORT}
--------------------------------------------
📝 Access the application at:
   Local: http://localhost:${PORT}
   
🔥 Available routes:
   Login:    http://localhost:${PORT}/auth/login
   Register: http://localhost:${PORT}/auth/register
   Reset:    http://localhost:${PORT}/auth/forgot-password
   
💡 Press Ctrl + Click on the links to open in browser
============================================
    `);
});