import express from 'express';

import { authenticateToken } from '../auth/middleware/auth.middleware';
import * as companyController from '../controllers/company.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ============================================
// COMPANY ROUTES
// ============================================

// GET /api/companies - Get all companies
router.get('/', companyController.getAllCompanies);

// GET /api/companies/search?q=query - Search companies
router.get('/search', companyController.searchCompanies);

// GET /api/companies/:id - Get company by ID
router.get('/:id', companyController.getCompany);

// POST /api/companies - Create company
router.post('/', companyController.createCompany);

// PATCH /api/companies/:id - Update company
router.patch('/:id', companyController.updateCompany);

// DELETE /api/companies/:id - Soft delete company
router.delete('/:id', companyController.deleteCompany);

export default router;
