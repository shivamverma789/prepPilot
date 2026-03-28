const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const profileCheck = require("../middlewares/profileCheck");
const passport = require("passport");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.logout);

// HOME PAGE — public
router.get("/", (req, res) => {
    res.render("home");
});

router.get("/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.profileCompleted) {
        return res.redirect("/onboarding");
    }

    res.render("dashboard/dashboard", { user: req.user });
});

router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    (req, res) => {
        res.redirect("/dashboard");
    }
);

router.get("/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
);
router.get("/auth/github/callback",
    passport.authenticate("github", {
        failureRedirect: "/login"
    }),
    (req, res) => {
        res.redirect("/dashboard");
    }
);

module.exports = router;
