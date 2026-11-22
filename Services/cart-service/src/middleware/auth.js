const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (claims.type !== 'ACCESS' || typeof claims.userId !== 'string' || !claims.userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.auth = { userId: claims.userId, roles: Array.isArray(claims.roles) ? claims.roles : [] };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  const roles = req.auth?.roles || [];
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Se requiere un rol de administrador.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
