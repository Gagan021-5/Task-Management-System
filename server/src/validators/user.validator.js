import { body } from 'express-validator';

export const updateUserValidator = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().trim()
    .isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  body('password').optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
