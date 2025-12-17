import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import type {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  Company,
} from '../../types/company.types';

export class CompanyService {
  async getAllCompanies(): Promise<Company[]> {
    return prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    }) as Promise<Company[]>;
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

  async searchCompanies(query: string): Promise<Company[]> {
    return prisma.company.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 20,
    }) as Promise<Company[]>;
  }
}

export default new CompanyService();
