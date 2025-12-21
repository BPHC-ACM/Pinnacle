import type { Request, Response } from 'express';

import { logger } from '../config/logger.config';
import companyService from '../services/company-service/company.service';
import { parsePagination } from '../types/pagination.types';

const handleError = (res: Response, error: unknown, message: string): void => {
  logger.error({ err: error }, message);
  res.status(500).json({ error: message });
};

export async function getAllCompanies(req: Request, res: Response): Promise<void> {
  try {
    const params = parsePagination(req.query as Record<string, unknown>);
    res.json(await companyService.getAllCompanies(params));
  } catch (error) {
    handleError(res, error, 'Failed to fetch companies');
  }
}

export async function getCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }
    const company = await companyService.getCompany(id);
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json(company);
  } catch (error) {
    handleError(res, error, 'Failed to fetch company');
  }
}

export async function createCompany(req: Request, res: Response): Promise<void> {
  try {
    res
      .status(201)
      .json(
        await companyService.createCompany(
          req.body as import('../types/company.types').CreateCompanyRequest,
        ),
      );
  } catch (error) {
    handleError(res, error, 'Failed to create company');
  }
}

export async function updateCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }
    const result = await companyService.updateCompany(
      id,
      req.body as import('../types/company.types').UpdateCompanyRequest,
    );
    if (!result) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to update company');
  }
}

export async function deleteCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }
    const result = await companyService.deleteCompany(id);
    if (!result) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete company');
  }
}

export async function searchCompanies(req: Request, res: Response): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    const params = parsePagination(req.query as Record<string, unknown>);
    res.json(await companyService.searchCompanies(q, params));
  } catch (error) {
    handleError(res, error, 'Failed to search companies');
  }
}
