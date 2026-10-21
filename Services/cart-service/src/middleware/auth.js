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
    req.auth = { userId: claims.userId };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
