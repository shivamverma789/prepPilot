module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.profileCompleted) {
        return res.redirect("/onboarding/step-1");
    }

    next();
};
