const authenticateUser = (req, res, next) => {
  console.log('🔐 Auth check:', {
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    sessionID: req.sessionID,
    cookies: req.headers.cookie
  });

  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized. Please login first.'
  });
};

module.exports = {
  authenticateUser
};
