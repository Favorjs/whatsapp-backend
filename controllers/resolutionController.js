const { Resolution,RegisteredHolders} = require('../models');
const { sendResolutionVoteMessage } = require('../services/messagingService');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const resolutions = await Resolution.findAll({
      order: [['created_at', 'DESC']]
    });
    res.send(resolutions);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description } = req.body;
    const resolution = await Resolution.create({ title, description });
    res.status(201).send(resolution);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.activate = async (req, res) => {
  try {
    const resolution = await Resolution.findByPk(req.params.id);
    
    if (!resolution) {
      return res.status(404).send({ error: 'Resolution not found' });
    }

    // Check if another resolution is active
    const activeResolution = await Resolution.findOne({
      where: { status: 'active' }
    });

    if (activeResolution && activeResolution.id !== resolution.id) {
      return res.status(400).send({ 
        error: 'Another resolution is already active' 
      });
    }

    // Update resolution status
    await resolution.update({
      status: 'active',
      votingStart: new Date(),
      votingEnd: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Notify shareholders
    const registeredholders = await RegisteredHolders.findAll({ 
      where: { status: 'active' } 
    });

    for (const registeredholder of registeredholders) {
      await sendResolutionVoteMessage(registeredholder, resolution);
    }

    res.send({ 
      success: true,
      message: `Voting started for resolution: ${resolution.title}`,
      shareholdersNotified: registeredholders.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.complete = async (req, res) => {
  try {
    const resolution = await Resolution.findByPk(req.params.id);
    
    if (!resolution) {
      return res.status(404).send({ error: 'Resolution not found' });
    }

    await resolution.update({
      status: 'completed'
    });

    res.send({ 
      success: true,
      message: `Voting completed for resolution: ${resolution.title}`
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};