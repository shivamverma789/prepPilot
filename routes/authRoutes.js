const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const profileCheck = require("../middlewares/profileCheck");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.logout);

router.get("/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.profileCompleted) {
        return res.redirect("/onboarding");
    }

    res.render("dashboard/dashboard", { user: req.user });
});



module.exports = router;
