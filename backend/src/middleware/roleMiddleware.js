const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: `This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authorize
};
