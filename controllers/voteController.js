const { Vote, Shareholder, Resolution } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      include: [
        { model: Shareholder },
        { model: Resolution }
      ],
      order: [['created_at', 'DESC']]
    });
    res.send(votes);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const summary = await Vote.findAll({
      attributes: [
        'resolutionId',
        'vote',
        [sequelize.fn('SUM', sequelize.col('votingPower')), 'totalPower'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'voteCount']
      ],
      include: [{ model: Resolution, attributes: ['title'] }],
      group: ['resolutionId', 'vote', 'Resolution.id'],
      raw: true
    });

    // Format the summary
    const formatted = summary.reduce((acc, row) => {
      const resolution = row['Resolution.title'] || 'Unknown';
      if (!acc[resolution]) {
        acc[resolution] = { YES: 0, NO: 0 };
      }
      acc[resolution][row.vote] = {
        power: parseFloat(row.totalPower),
        count: parseInt(row.voteCount)
      };
      return acc;
    }, {});

    res.send(formatted);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};