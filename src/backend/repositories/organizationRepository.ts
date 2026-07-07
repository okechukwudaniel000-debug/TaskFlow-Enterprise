import { db } from "../database/db";
import { Organization } from "../../types";

export class OrganizationRepository {
  async getAll(): Promise<Organization[]> {
    return db.organizations;
  }

  async getById(id: string): Promise<Organization | null> {
    return db.organizations.find(o => o.id === id) || null;
  }

  async create(org: Organization): Promise<Organization> {
    const updated = [...db.organizations, org];
    db.organizations = updated;
    return org;
  }

  async update(id: string, updatedData: Partial<Organization>): Promise<Organization | null> {
    const orgs = db.organizations;
    const index = orgs.findIndex(o => o.id === id);
    if (index === -1) return null;

    const updatedOrg = { 
      ...orgs[index], 
      ...updatedData
    };
    
    const updatedOrgs = [...orgs];
    updatedOrgs[index] = updatedOrg;
    db.organizations = updatedOrgs;

    return updatedOrg;
  }

  async delete(id: string): Promise<boolean> {
    const orgs = db.organizations;
    const beforeLength = orgs.length;
    const filtered = orgs.filter(o => o.id !== id);
    db.organizations = filtered;
    return filtered.length < beforeLength;
  }
}

export const organizationRepository = new OrganizationRepository();
