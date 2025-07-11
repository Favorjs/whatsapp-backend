const { check, validationResult } = require('express-validator');
const { Shareholder, Resolution } = require('../models');
const { validatePhoneNumber } = require('../config/twilio');

// Common validation error formatter
const formatValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        param: err.param,
        message: err.msg,
        location: err.location
      }))
    });
  }
  next();
};

// Shareholder validators
const validateShareholder = [
  check('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must be less than 255 characters'),
  
  check('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .custom(async (value, { req }) => {
      try {
        validatePhoneNumber(value);
        const shareholder = await Shareholder.findOne({ 
          where: { phoneNumber: value } 
        });
        if (shareholder && (!req.params.id || shareholder.id !== req.params.id)) {
          throw new Error('Phone number already registered');
        }
      } catch (err) {
        throw new Error(err.message);
      }
    }),
  
  check('shareholding')
    .notEmpty().withMessage('Shareholding is required')
    .isFloat({ gt: 0 }).withMessage('Shareholding must be a positive number'),
  
  formatValidationErrors
];

// Resolution validators
const validateResolution = [
  check('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  
  check('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  
  formatValidationErrors
];

// Vote validators
const validateVote = [
  check('vote')
    .trim()
    .notEmpty().withMessage('Vote is required')
    .isIn(['YES', 'NO']).withMessage('Vote must be either YES or NO'),
  
  check('shareholderId')
    .notEmpty().withMessage('Shareholder ID is required')
    .isUUID().withMessage('Invalid shareholder ID')
    .custom(async (value) => {
      const shareholder = await Shareholder.findByPk(value);
      if (!shareholder) {
        throw new Error('Shareholder not found');
      }
    }),
  
  check('resolutionId')
    .notEmpty().withMessage('Resolution ID is required')
    .isUUID().withMessage('Invalid resolution ID')
    .custom(async (value) => {
      const resolution = await Resolution.findByPk(value);
      if (!resolution || resolution.status !== 'active') {
        throw new Error('Resolution not available for voting');
      }
    }),
  
  formatValidationErrors
];

// Admin validators
const validateAdmin = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .custom(async (value, { req }) => {
      const admin = await Admin.findOne({ where: { email: value } });
      if (admin && (!req.params.id || admin.id !== req.params.id)) {
        throw new Error('Email already in use');
      }
    }),
  
  check('password')
    .if((value, { req }) => req.method === 'POST' || value)
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  check('role')
    .optional()
    .isIn(['admin', 'superadmin']).withMessage('Invalid role specified'),
  
  formatValidationErrors
];

// WhatsApp message validator
const validateWhatsAppMessage = (req, res, next) => {
  const { From, Body } = req.body;
  
  if (!From || !Body) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields (From or Body)'
    });
  }

  try {
    validatePhoneNumber(From);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  next();
};

module.exports = {
  validateShareholder,
  validateResolution,
  validateVote,
  validateAdmin,
  validateWhatsAppMessage,
  formatValidationErrors
};