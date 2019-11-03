const router = require('express').Router();
const passport = require('passport');
const { CLIENT_URL, SERVER_URL } = require('../../constants');

const AUTH_FAIL_REDIRECT_URL = '/auth/login/failed';

router.get('/login/success', (req, res, next) => {
  if (req.user) {
    return res.json({
      authenticated: true,
      user: req.user,
      cookies: req.cookies,
    });
  }
});

router.get('/login/failed', (req, res, next) => {
  console.log('you reached login failure');
  res.status(401).json({
    message: 'user failed to authenticate',
  });
});

router.get('/logout', (req, res, next) => {
  console.log('user logged out');
  req.logout();
  res.redirect(CLIENT_URL);
});

router.get(
  '/google/redirect',
  passport.authenticate('google', {
    successRedirect: CLIENT_URL,
    failureRedirect: AUTH_FAIL_REDIRECT_URL,
  })
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

module.exports = router;
