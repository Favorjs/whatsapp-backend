
const { Admin } = require('../models');
const jwt = require('jsonwebtoken');
const { Shareholder, Resolution, Vote } = require('../models');


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await admin.validPassword(password))) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }

    const token = admin.generateAuthToken();
    res.send({ admin, token });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    // Get dashboard statistics
    const stats = {
      totalShareholders: await Shareholder.count(),
      activeResolutions: await Resolution.count({ where: { status: 'active' } }),
      totalVotes: await Vote.count(),
      recentVotes: await Vote.findAll({
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [
          { model: Shareholder, as: 'shareholder' },
          { model: Resolution, as: 'resolution' }
        ]
      })
    };

    res.send(stats);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const admin = await Admin.create({ email, password, role });
    res.status(201).send(admin);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};