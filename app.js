require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo").default;
const methodOverride = require("method-override");
const cors = require("cors");

const app = express();


// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// View Engine
app.set("view engine", "ejs");

app.use(cors({
  origin: process.env.LIVEKIT_APP_URL || "http://localhost:4000",
  credentials: true
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("trust proxy", 1);

// Session Config
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}));



// Passport Config
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// Routes
app.use("/", require("./routes/authRoutes"));

const onboardingRoutes = require("./routes/onboardingRoutes");
app.use("/onboarding", onboardingRoutes);

const assessmentRoutes = require("./routes/assessmentRoutes");
app.use("/", assessmentRoutes);

const roadmapRoutes = require("./routes/roadmapRoutes");
app.use("/", roadmapRoutes);

const progressRoutes = require("./routes/progressRoutes");
app.use("/progress", progressRoutes);

//edit profile routes
const profileRoutes = require("./routes/profileRoutes");
app.use("/profile", profileRoutes);

app.use("/resume", require("./routes/resumeRoutes"));

const resumeBuilderRoutes = require("./routes/resumeBuilderRoutes");
app.use("/builder", resumeBuilderRoutes);

app.use("/api/interview", require("./routes/interviewRoutes"));

const activityRoutes = require("./routes/activityRoutes");
app.use("/activity", activityRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render("error", { message: "Page not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const message = process.env.NODE_ENV === "production" ? null : err.message;
    res.status(err.status || 500).render("error", { message });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
