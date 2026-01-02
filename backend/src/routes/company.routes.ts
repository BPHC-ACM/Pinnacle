import express from 'express';

import { authenticateToken, isAdmin, adminRateLimiter } from '../auth/middleware';
import * as companyController from '../controllers/company.controller';
import { validateBody } from '../middleware/validate.middleware';
import { createCompanySchema, updateCompanySchema } from '../types/company.types';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// COMPANY ROUTES

// GET /api/companies - Get all companies
router.get('/', companyController.getAllCompanies);

// GET /api/companies/search?q=query - Search companies
router.get('/search', companyController.searchCompanies);

// GET /api/companies/:id - Get company by ID
router.get('/:id', companyController.getCompany);

// POST /api/companies - Create company (admin only with rate limiting)
router.post(
  '/',
  adminRateLimiter,
  isAdmin,
  validateBody(createCompanySchema),
  companyController.createCompany,
);

// PATCH /api/companies/:id - Update company (admin only with rate limiting)
router.patch(
  '/:id',
  adminRateLimiter,
  isAdmin,
  validateBody(updateCompanySchema),
  companyController.updateCompany,
);

// DELETE /api/companies/:id - Soft delete company (admin only with rate limiting)
router.delete('/:id', adminRateLimiter, isAdmin, companyController.deleteCompany);

export default router;
