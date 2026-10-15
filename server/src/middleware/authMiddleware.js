const jwt = require('jsonwebtoken');
const config = require('../config');
const crmRepo = require('../db/crmRepository');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Access token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Access token is missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Token has expired or is invalid' });
    }

    const user = await crmRepo.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User account not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err.message);
    return res.status(500).json({ error: 'Authentication check failed' });
  }
}

module.exports = authMiddleware;
