const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const { SERVER_URL } = require('../constants');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/auth/google/redirect`,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('google auth passport callback fired');
      try {
        User.findOrCreate(
          { googleId: profile.id },
          {
            name: profile._json.name,
            email: profile._json.email,
            thumbnail: profile._json.picture,
          },
          (error, user) => {
            if (error) throw error;
            done(null, user);
          }
        );
      } catch (error) {
        if (error) {
          console.log('error while findOrCreate');
          console.error(error);
        }
      }
    }
  )
);
