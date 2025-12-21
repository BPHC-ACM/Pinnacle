import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import type {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  Company,
} from '../../types/company.types';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination.types';

export class CompanyService {
  async getAllCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = params ?? {};
    const where = { deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);
    return {
      data: data as Company[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCompany(id: string): Promise<Company | null> {
    return prisma.company.findFirst({
      where: { id, deletedAt: null },
    }) as Promise<Company | null>;
  }

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    const company = (await prisma.company.create({ data })) as Company;
    logger.info({ companyId: company.id, name: company.name }, 'Company created');
    return company;
  }

  async updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company | null> {
    const company = await prisma.company.findFirst({ where: { id, deletedAt: null } });
    if (!company) return null;
    return prisma.company.update({ where: { id }, data }) as Promise<Company>;
  }

  async deleteCompany(id: string): Promise<Company | null> {
    const company = await prisma.company.findFirst({ where: { id, deletedAt: null } });
    if (!company) return null;
    const deleted = (await prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Company;
    logger.info({ companyId: id, name: deleted.name }, 'Company soft deleted');
    return deleted;
  }

  async searchCompanies(
    query: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Company>> {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = params ?? {};
    const where = {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { industry: { contains: query, mode: 'insensitive' as const } },
      ],
    };
    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);
    return {
      data: data as Company[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new CompanyService();
