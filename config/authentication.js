const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'not authorized'});
};

const forwardAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(301).redirect('/');
};

module.exports = {
  ensureAuthenticated,
  forwardAuthenticated,
};
