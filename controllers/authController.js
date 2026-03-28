const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const passport = require("passport");

exports.getRegister = (req, res) => {
    res.render("auth/register");
};

exports.postRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect("/register?error=exists");
        }
        const username = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();
        res.redirect("/login");

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.getLogin = (req, res) => {
    res.render("auth/login");
};

exports.postLogin = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.redirect("/login");
        }

        // This creates the session (VERY IMPORTANT)
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            // 🔥 SMART REDIRECT BASED ON ONBOARDING STATUS
            if (!user.profileCompleted) {
                return res.redirect("/onboarding");
            } else {
                return res.redirect("/dashboard");
            }
        });
    })(req, res, next);
};


exports.logout = (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
};
