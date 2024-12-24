import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import session from "express-session";
import flash from "connect-flash";
import expressEjsLayouts from "express-ejs-layouts";
import MySQLStore from "express-mysql-session";
import openBrowser from "open";

import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import editorRoutes from "./routes/editor.routes.js";
import authMiddleware from "./middlewares/auth.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();

// Correct way to get __dirname in ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Session store configuration
const MySQLStoreSession = MySQLStore(session);
import pool from "./config/database.js";

const sessionStore = new MySQLStoreSession(
  {
    clearExpired: true,
    checkExpirationInterval: 900000, // in milliseconds (15min)
    expiration: 86400000, // (24hours)
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  },
  pool
);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", "layouts/main.ejs"); // Adjusted to work with express-ejs-layouts
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Session setup
app.use(
  session({
    key: "auth_session",
    secret: process.env.SESSION_SECRET || "password",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 86400000,
      sameSite: "strict",
    },
  })
);

app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
// app.use("/api/admin", authMiddleware.verifyToken, adminRoutes);
app.use("/api/editor", authMiddleware.verifyToken, editorRoutes);
// Admin Routes
app.use("/admin", adminRoutes);
// Routes
app.use("/", articleRoutes);
// Public routes
app.get("/", (req, res) => {
  res.render("home", {
    title: "Trang Chủ",
  });
});

app.get("/auth/login", authMiddleware.optionalAuth, (req, res) => {
  res.render("auth/login", {
    title: "Đăng Nhập",
  });
});

app.get("/auth/register", authMiddleware.ensureGuest, (req, res) => {
  res.render("auth/register", {
    title: "Đăng Ký",
  });
});

app.get("/auth/forgot-password", authMiddleware.ensureGuest, (req, res) => {
  res.render("auth/forgot-password", {
    title: "Quên Mật Khẩu",
  });
});

// User route
app.get("/user/profile", authMiddleware.ensureAuthenticated, (req, res) => {
  res.render("user/profile", {
    title: "Thông Tin Cá Nhân",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash("error_msg", "Có lỗi xảy ra từ phía server!");
  res.status(err.status || 500).render("errors/error", {
    title: "Lỗi Server",
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.clear();
  console.log(
    `
============================================
🚀 Server is running on port ${PORT}
--------------------------------------------
📝 Access the application at:
    Local: http://localhost:${PORT}

🔥 Available routes:
    Login:    http://localhost:${PORT}/auth/login
    Register: http://localhost:${PORT}/auth/register
    Reset:    http://localhost:${PORT}/auth/forgot-password
    Admin:    http://localhost:${PORT}/admin/dashboard

💡 Press Ctrl + Click on the links to open in browser
============================================
    `
  );
});
