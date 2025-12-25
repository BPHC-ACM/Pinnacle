import type { Request, Response } from 'express';

import companyService from '../services/company-service/company.service';
import type { CreateCompanyRequest, UpdateCompanyRequest } from '../types/company.types';
import { ValidationError, NotFoundError } from '../types/errors.types';
import { parsePagination } from '../types/pagination.types';

const getParamId = (req: Request): string => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('ID parameter is missing', 'ID parameter is required');
  }
  return id;
};

export async function getAllCompanies(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await companyService.getAllCompanies(params));
}

export async function getCompany(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const company = await companyService.getCompany(id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${id} not found`, 'Company not found');
  }
  res.json(company);
}

export async function createCompany(req: Request, res: Response): Promise<void> {
  res.status(201).json(await companyService.createCompany(req.body as CreateCompanyRequest));
}

export async function updateCompany(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const result = await companyService.updateCompany(id, req.body as UpdateCompanyRequest);
  res.json(result);
}

export async function deleteCompany(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  await companyService.deleteCompany(id);
  res.status(204).send();
}

export async function searchCompanies(req: Request, res: Response): Promise<void> {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    throw new ValidationError('Search query is required', 'Search query is required');
  }
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await companyService.searchCompanies(q, params));
}
