// backend/middleware/auth.js
module.exports = function adminAuth(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(500).json({ success: false, message: 'Admin secret not configured' });
  }

  // Prefer header; support query param for quick testing (not recommended in prod)
  const header = req.get('x-admin-secret') || req.query.admin || '';
  if (!header || header !== adminSecret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};
