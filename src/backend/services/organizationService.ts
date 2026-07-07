import { organizationRepository } from "../repositories/organizationRepository";
import { Organization } from "../../types";

export class OrganizationService {
  async getOrganizations(): Promise<Organization[]> {
    return await organizationRepository.getAll();
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return await organizationRepository.getById(id);
  }

  async createOrganization(name: string, subscriptionPlan: "Free" | "Pro" | "Enterprise"): Promise<Organization> {
    const id = `org-${Date.now()}`;
    const newOrg: Organization = {
      id,
      name,
      subscriptionPlan
    };
    return await organizationRepository.create(newOrg);
  }

  async updateOrganization(id: string, updatedData: Partial<Organization>): Promise<Organization | null> {
    return await organizationRepository.update(id, updatedData);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    return await organizationRepository.delete(id);
  }
}

export const organizationService = new OrganizationService();
