import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository } from "../repositories/userRepository";
import { authProfileRepository } from "../repositories/authProfileRepository";
import { TokenService } from "../utils/jwt";
import { User, UserRole } from "../../types";
import { AuthProfile } from "../database/db";

const DEFAULT_MOCK_PASSWORD = "Password123!";

export class AuthService {
  /**
   * Helper to ensure an auth profile exists for existing users (like mock users).
   * Automatically initializes their password to "Password123!" if none is set.
   */
  private async ensureAuthProfile(user: User): Promise<AuthProfile> {
    let profile = await authProfileRepository.getByUserId(user.id);
    if (!profile) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(DEFAULT_MOCK_PASSWORD, salt);
      profile = {
        userId: user.id,
        passwordHash,
        isVerified: true, // Default mock users are pre-verified
        loginAttempts: 0,
        lockUntil: null,
        refreshTokens: [],
        sessions: []
      };
      await authProfileRepository.create(profile);
    }
    return profile;
  }

  async register(
    email: string,
    name: string,
    password: string,
    ip?: string,
    userAgent?: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existing = await userRepository.getByEmail(email);
    if (existing) {
      throw new Error("Email already registered.");
    }

    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
      bio: "Member of the Platform",
      role: UserRole.MEMBER,
      timezone: "America/Los_Angeles",
      language: "en",
      theme: "light",
      isOnline: true
    };

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate email verification details
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const sessionId = `sess-${crypto.randomBytes(16).toString("hex")}`;
    const access = TokenService.generateAccessToken({
      userId,
      email: newUser.email,
      role: newUser.role
    });
    const refresh = TokenService.generateRefreshToken({ userId, sessionId });

    const profile: AuthProfile = {
      userId,
      passwordHash,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      loginAttempts: 0,
      lockUntil: null,
      refreshTokens: [refresh],
      sessions: [
        {
          sessionId,
          userAgent,
          ip,
          lastActive: new Date().toISOString()
        }
      ]
    };

    await userRepository.create(newUser);
    await authProfileRepository.create(profile);

    await authProfileRepository.log({
      userId,
      email,
      action: "REGISTRATION",
      ip,
      userAgent,
      details: `User registered successfully. Verification token: ${verificationToken}`
    });

    return { user: newUser, accessToken: access, refreshToken: refresh };
  }

  async login(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await userRepository.getByEmail(email);
    if (!user) {
      await authProfileRepository.log({
        email,
        action: "LOGIN_FAILED",
        ip,
        userAgent,
        details: "Login attempt with non-existent email."
      });
      throw new Error("Invalid email or password.");
    }

    const profile = await this.ensureAuthProfile(user);

    // Check account lockout
    if (profile.lockUntil) {
      const lockTime = new Date(profile.lockUntil).getTime();
      if (lockTime > Date.now()) {
        const minutesLeft = Math.ceil((lockTime - Date.now()) / 60000);
        await authProfileRepository.log({
          userId: user.id,
          email,
          action: "LOGIN_LOCKED",
          ip,
          userAgent,
          details: `Login blocked. Account is temporarily locked. Try again in ${minutesLeft} mins.`
        });
        throw new Error(`Account temporarily locked. Please try again in ${minutesLeft} minutes.`);
      } else {
        // Lock expired, reset attempts
        await authProfileRepository.update(user.id, { lockUntil: null, loginAttempts: 0 });
        profile.loginAttempts = 0;
        profile.lockUntil = null;
      }
    }

    const isMatch = await bcrypt.compare(password, profile.passwordHash);
    if (!isMatch) {
      const attempts = profile.loginAttempts + 1;
      let lockUntil: string | null = null;
      let details = `Failed login attempt. Total consecutive failures: ${attempts}.`;

      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins lock
        details += " Account locked for 15 minutes.";
      }

      await authProfileRepository.update(user.id, { loginAttempts: attempts, lockUntil });
      await authProfileRepository.log({
        userId: user.id,
        email,
        action: attempts >= 5 ? "LOCKOUT" : "LOGIN_FAILED",
        ip,
        userAgent,
        details
      });

      if (attempts >= 5) {
        throw new Error("Account locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.");
      }
      throw new Error("Invalid email or password.");
    }

    // Success login, generate session and tokens
    const sessionId = `sess-${crypto.randomBytes(16).toString("hex")}`;
    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    const refreshToken = TokenService.generateRefreshToken({ userId: user.id, sessionId });

    // Append session and token
    const updatedSessions = [
      ...profile.sessions,
      {
        sessionId,
        userAgent,
        ip,
        lastActive: new Date().toISOString()
      }
    ];
    const updatedRefreshTokens = [...profile.refreshTokens, refreshToken];

    await authProfileRepository.update(user.id, {
      loginAttempts: 0,
      lockUntil: null,
      sessions: updatedSessions,
      refreshTokens: updatedRefreshTokens
    });

    await userRepository.update(user.id, { isOnline: true });

    await authProfileRepository.log({
      userId: user.id,
      email,
      action: "LOGIN_SUCCESS",
      ip,
      userAgent,
      details: "User logged in successfully."
    });

    return { user: { ...user, isOnline: true }, accessToken, refreshToken };
  }

  async refreshToken(
    oldRefreshToken: string,
    ip?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = TokenService.verifyRefreshToken(oldRefreshToken);
      const profile = await authProfileRepository.getByUserId(decoded.userId);
      const user = await userRepository.getById(decoded.userId);

      if (!profile || !user) {
        throw new Error("Invalid session.");
      }

      // Check if this refresh token is known/valid
      const tokenIndex = profile.refreshTokens.indexOf(oldRefreshToken);
      if (tokenIndex === -1) {
        // SECURITY VIOLATION: Refresh token reuse detected!
        // Invalidate all sessions of this user immediately as a precaution!
        await authProfileRepository.update(decoded.userId, {
          refreshTokens: [],
          sessions: []
        });
        await userRepository.update(decoded.userId, { isOnline: false });

        await authProfileRepository.log({
          userId: decoded.userId,
          action: "SECURITY_VIOLATION_REUSE",
          ip,
          userAgent,
          details: "Potential Refresh Token Reuse Hijacking! Invalidated all sessions of this user."
        });

        throw new Error("Security Alert: Token session has expired. Please login again.");
      }

      // Generate rotated token pair
      const newSessionId = decoded.sessionId; // Preserve sessionId
      const newAccessToken = TokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      const newRefreshToken = TokenService.generateRefreshToken({
        userId: user.id,
        sessionId: newSessionId
      });

      // Update stored tokens: remove old, add new
      const updatedRefreshTokens = [...profile.refreshTokens];
      updatedRefreshTokens[tokenIndex] = newRefreshToken;

      // Update session lastActive timestamp
      const updatedSessions = profile.sessions.map(s => {
        if (s.sessionId === newSessionId) {
          return { ...s, lastActive: new Date().toISOString() };
        }
        return s;
      });

      await authProfileRepository.update(user.id, {
        refreshTokens: updatedRefreshTokens,
        sessions: updatedSessions
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (e: any) {
      throw new Error(e.message || "Invalid or expired session token.");
    }
  }

  async logout(
    userId: string,
    refreshTokenString?: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const profile = await authProfileRepository.getByUserId(userId);
    if (!profile) return;

    let updatedRefreshTokens = [...profile.refreshTokens];
    let updatedSessions = [...profile.sessions];

    if (refreshTokenString) {
      try {
        const decoded = TokenService.verifyRefreshToken(refreshTokenString);
        updatedRefreshTokens = updatedRefreshTokens.filter(t => t !== refreshTokenString);
        updatedSessions = updatedSessions.filter(s => s.sessionId !== decoded.sessionId);
      } catch (e) {
        // ignore invalid token decoding
      }
    }

    await authProfileRepository.update(userId, {
      refreshTokens: updatedRefreshTokens,
      sessions: updatedSessions
    });

    // Check if the user has any more active sessions left, if not, set offline
    if (updatedSessions.length === 0) {
      await userRepository.update(userId, { isOnline: false });
    }

    await authProfileRepository.log({
      userId,
      action: "LOGOUT",
      ip,
      userAgent,
      details: "User logged out of session."
    });
  }

  async requestPasswordReset(
    email: string,
    ip?: string,
    userAgent?: string
  ): Promise<string> {
    const user = await userRepository.getByEmail(email);
    if (!user) {
      // Return a standard mock success response to avoid email enumeration attacks
      return "If that email exists in our system, a reset token was generated.";
    }

    const profile = await this.ensureAuthProfile(user);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // 1 hour

    await authProfileRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpires
    });

    await authProfileRepository.log({
      userId: user.id,
      email,
      action: "PASSWORD_RESET_REQUEST",
      ip,
      userAgent,
      details: `Password reset requested. Security Reset Token: ${resetToken}`
    });

    return resetToken;
  }

  async resetPassword(
    token: string,
    passwordNew: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const profile = await authProfileRepository.getByResetToken(token);
    if (!profile) {
      throw new Error("Invalid or expired reset token.");
    }

    if (profile.passwordResetExpires) {
      const expiry = new Date(profile.passwordResetExpires).getTime();
      if (expiry < Date.now()) {
        throw new Error("Reset token has expired.");
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordNew, salt);

    // Password reset success -> reset token and force logout everywhere (revoke all active tokens/sessions)
    await authProfileRepository.update(profile.userId, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      refreshTokens: [],
      sessions: []
    });

    await userRepository.update(profile.userId, { isOnline: false });

    await authProfileRepository.log({
      userId: profile.userId,
      action: "PASSWORD_RESET_SUCCESS",
      ip,
      userAgent,
      details: "Password reset successful. Terminated all active sessions."
    });
  }

  async verifyEmail(
    token: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const profile = await authProfileRepository.getByVerificationToken(token);
    if (!profile) {
      throw new Error("Invalid or expired verification token.");
    }

    if (profile.verificationTokenExpires) {
      const expiry = new Date(profile.verificationTokenExpires).getTime();
      if (expiry < Date.now()) {
        throw new Error("Verification token has expired. Please request a new verification token.");
      }
    }

    await authProfileRepository.update(profile.userId, {
      isVerified: true,
      verificationToken: undefined,
      verificationTokenExpires: undefined
    });

    await authProfileRepository.log({
      userId: profile.userId,
      action: "EMAIL_VERIFICATION",
      ip,
      userAgent,
      details: "Email verified successfully."
    });
  }

  async getActiveSessions(userId: string): Promise<any[]> {
    const profile = await authProfileRepository.getByUserId(userId);
    return profile ? profile.sessions : [];
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const profile = await authProfileRepository.getByUserId(userId);
    if (!profile) return;

    const updatedSessions = profile.sessions.filter(s => s.sessionId !== sessionId);
    
    // We must find which refresh token belongs to this sessionId, or we can clear expired refresh tokens.
    // To simplify, we can filter or re-verify. But a cleaner approach: since we want to terminate that session,
    // we can also clear refresh tokens that decode to this sessionId.
    let updatedRefreshTokens = [...profile.refreshTokens];
    for (const t of profile.refreshTokens) {
      try {
        const decoded = TokenService.verifyRefreshToken(t);
        if (decoded.sessionId === sessionId) {
          updatedRefreshTokens = updatedRefreshTokens.filter(rt => rt !== t);
        }
      } catch (e) {
        // filter out invalid ones
      }
    }

    await authProfileRepository.update(userId, {
      sessions: updatedSessions,
      refreshTokens: updatedRefreshTokens
    });

    if (updatedSessions.length === 0) {
      await userRepository.update(userId, { isOnline: false });
    }

    await authProfileRepository.log({
      userId,
      action: "SESSION_REVOKED",
      ip,
      userAgent,
      details: `Revoked session: ${sessionId}`
    });
  }

  async getSecurityLogs(userId: string): Promise<any[]> {
    return authProfileRepository.getAuditLogs(userId);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
    return await userRepository.update(userId, data);
  }

  async getAllUsers(): Promise<User[]> {
    return await userRepository.getAll();
  }
}

export const authService = new AuthService();
