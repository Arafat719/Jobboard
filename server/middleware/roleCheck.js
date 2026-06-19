export const requireEmployer = (req, res, next) => {
  if (req.user?.role !== 'employer') {
    return res.status(403).json({ message: 'Access denied: employer role required' });
  }
  next();
};

export const requireCandidate = (req, res, next) => {
  if (req.user?.role !== 'candidate') {
    return res.status(403).json({ message: 'Access denied: candidate role required' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: admin role required' });
  }
  next();
};
