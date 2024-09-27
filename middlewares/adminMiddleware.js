// middlewares/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
    const user = req.user;
    console.log(`Admin Check: User ID: ${user.id}, Is Admin: ${user.is_admin}`);
  
    if (user && user.is_admin) {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  };
  
  module.exports = adminMiddleware;