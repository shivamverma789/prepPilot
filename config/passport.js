const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports = function(passport) {

    passport.use(new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: "User not found" });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Incorrect password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: email,
                    password: "oauth" // placeholder
                });
            }

            return done(null, user);

        } catch (err) {
            return done(err, null);
        }
    }));

    passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // ⚠️ GitHub may NOT provide email
            let email = profile.emails?.[0]?.value;

            if (!email) {
                email = `${profile.username}@github.com`; // fallback
            }

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    name: profile.username,
                    email: email,
                    password: "oauth"
                });
            }

            return done(null, user);

        } catch (err) {
            return done(err, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
