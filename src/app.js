import "dotenv/config"
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import { Sequelize } from "sequelize";
import { testConnection } from "./config/database.js"

import articleRoutes from "./routes/article.routes.js"
import authRoutes from "./routes/auth.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import editorRoutes from "./routes/editor.routes.js"

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", articleRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/editor", editorRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3002;
testConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})