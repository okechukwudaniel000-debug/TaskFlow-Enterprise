import { db, AuthProfile, SecurityAuditLog } from "../database/db";

export class AuthProfileRepository {
  async getByUserId(userId: string): Promise<AuthProfile | null> {
    return db.authProfiles.find(ap => ap.userId === userId) || null;
  }

  async getByVerificationToken(token: string): Promise<AuthProfile | null> {
    return db.authProfiles.find(ap => ap.verificationToken === token) || null;
  }

  async getByResetToken(token: string): Promise<AuthProfile | null> {
    return db.authProfiles.find(ap => ap.passwordResetToken === token) || null;
  }

  async create(profile: AuthProfile): Promise<AuthProfile> {
    db.authProfiles = [...db.authProfiles, profile];
    return profile;
  }

  async update(userId: string, updatedData: Partial<AuthProfile>): Promise<AuthProfile | null> {
    const profiles = db.authProfiles;
    const index = profiles.findIndex(ap => ap.userId === userId);
    if (index === -1) return null;

    const updatedProfile = { ...profiles[index], ...updatedData };
    const updatedProfiles = [...profiles];
    updatedProfiles[index] = updatedProfile;
    db.authProfiles = updatedProfiles;

    return updatedProfile;
  }

  async delete(userId: string): Promise<boolean> {
    const profiles = db.authProfiles;
    const initialLen = profiles.length;
    db.authProfiles = profiles.filter(ap => ap.userId !== userId);
    return db.authProfiles.length < initialLen;
  }

  // Audit Logs
  async log(log: Omit<SecurityAuditLog, "id" | "timestamp">): Promise<SecurityAuditLog> {
    const newLog: SecurityAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    db.auditLogs = [newLog, ...db.auditLogs].slice(0, 1000); // Limit to 1000 entries
    return newLog;
  }

  async getAuditLogs(userId?: string): Promise<SecurityAuditLog[]> {
    if (userId) {
      return db.auditLogs.filter(l => l.userId === userId);
    }
    return db.auditLogs;
  }
}

export const authProfileRepository = new AuthProfileRepository();
