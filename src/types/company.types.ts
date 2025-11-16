export interface Company {
  id: string;
  name: string;
  website?: string;
  description?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyRequest {
  name: string;
  website?: string;
  description?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  website?: string;
  description?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}
