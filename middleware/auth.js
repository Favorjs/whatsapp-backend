const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      throw new Error();
    }

    req.token = token;
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).send({ error: 'Admin access required' });
  }
  next();
};