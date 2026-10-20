const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Administrator role required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
