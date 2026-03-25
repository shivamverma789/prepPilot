require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const cors = require("cors");

const app = express();


// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// View Engine
app.set("view engine", "ejs");

app.use(cors({
  origin: "http://localhost:4000", // LiveKit app
  credentials: true
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Session Config (IMPORTANT)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
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

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
