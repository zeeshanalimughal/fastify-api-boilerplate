import { UserRepository } from "../repositories/userRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { VerificationTokenRepository } from "../repositories/verificationTokenRepository";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import {
  generateVerificationToken,
  generatePasswordResetToken,
  getTokenExpiration,
  isTokenExpired,
} from "../../utils/tokens";
import {
  generateVerificationUrl,
  generatePasswordResetUrl,
  generateFrontendUrl,
} from "../../utils/urls";
import { Errors } from "../../constants/errors";
import { TokenTypes } from "../../constants/tokens";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../../api/validators/authSchema";
import { NewRefreshToken } from "../entities/refreshToken";
import { NewVerificationToken } from "../entities/verificationToken";
import { env } from "../../config/env";
import { EmailService } from "../../lib/email";

function parseExpiration(str: string) {
  const match = str.match(/(\d+)([dhms])/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
}

export class AuthService {
  private users = new UserRepository();
  private refreshRepo = new RefreshTokenRepository();
  private verificationRepo = new VerificationTokenRepository();
  private emailService = new EmailService();

  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await this.users.findByEmail(data.email);
    if (existingUser) {
      throw new Error(Errors.EMAIL_ALREADY_EXISTS);
    }

    const hashed = await hashPassword(data.password);
    const user = await this.users.create({
      ...data,
      password: hashed,
      emailVerified: false,
    });

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationData: NewVerificationToken = {
      token: verificationToken,
      userId: user.id,
      type: TokenTypes.EMAIL_VERIFICATION,
      expiresAt: getTokenExpiration(TokenTypes.EMAIL_VERIFICATION),
    };

    await this.verificationRepo.create(verificationData);

    // Send verification email
    try {
      const verificationUrl = generateVerificationUrl(verificationToken);
      await this.emailService.sendEmail({
        to: user.email,
        template: "VERIFY_EMAIL",
        variables: {
          name: user.name,
          verificationUrl,
          appName: env.APP_NAME || "Your App Name",
        },
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return {
      message: "Registration successful. Please check your email to verify your account.",
      requiresVerification: true,
    };
  }

  async login(data: LoginInput) {
    const user = await this.users.findByEmail(data.email);
    if (!user) {
      throw new Error(Errors.INVALID_CREDENTIALS);
    }

    const valid = await verifyPassword(data.password, user.password);
    if (!valid) {
      throw new Error(Errors.INVALID_CREDENTIALS);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error(Errors.EMAIL_NOT_VERIFIED);
    }

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async refresh(oldToken: string) {
    const stored = await this.refreshRepo.find(oldToken);
    if (!stored || stored.revoked) {
      throw new Error(Errors.REFRESH_REVOKED);
    }

    if (stored.expiresAt < new Date()) {
      throw new Error(Errors.TOKEN_EXPIRED);
    }

    await this.refreshRepo.revoke(stored.id);

    const user = await this.users.findById(stored.userId);
    if (!user) {
      throw new Error(Errors.USER_NOT_FOUND);
    }

    const tokens = await this.generateTokens(stored.userId, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.verificationRepo.findByToken(token);

    if (!verificationToken) {
      throw new Error(Errors.VERIFICATION_TOKEN_INVALID);
    }

    if (verificationToken.used) {
      throw new Error(Errors.VERIFICATION_TOKEN_INVALID);
    }

    if (isTokenExpired(verificationToken.expiresAt)) {
      throw new Error(Errors.VERIFICATION_TOKEN_EXPIRED);
    }

    if (verificationToken.type !== TokenTypes.EMAIL_VERIFICATION) {
      throw new Error(Errors.VERIFICATION_TOKEN_INVALID);
    }

    // Mark user as verified
    const user = await this.users.markEmailAsVerified(verificationToken.userId);
    if (!user) {
      throw new Error(Errors.USER_NOT_FOUND);
    }

    // Mark token as used
    await this.verificationRepo.markUsed(verificationToken.id);

    // Send welcome email
    try {
      await this.emailService.sendEmail({
        to: user.email,
        template: "WELCOME",
        variables: {
          name: user.name,
          appName: env.APP_NAME,
        },
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return { message: "Email verified successfully" };
  }

  async resendVerificationEmail(data: VerifyEmailInput) {
    const user = await this.users.findByEmail(data.email);
    if (!user) {
      throw new Error(Errors.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
      throw new Error(Errors.EMAIL_ALREADY_VERIFIED);
    }

    // Delete any existing verification tokens
    await this.verificationRepo.deleteByUserId(user.id, TokenTypes.EMAIL_VERIFICATION);

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationData: NewVerificationToken = {
      token: verificationToken,
      userId: user.id,
      type: TokenTypes.EMAIL_VERIFICATION,
      expiresAt: getTokenExpiration(TokenTypes.EMAIL_VERIFICATION),
    };

    await this.verificationRepo.create(verificationData);

    // Send verification email
    const verificationUrl = generateVerificationUrl(verificationToken);
    await this.emailService.sendEmail({
      to: user.email,
      template: "VERIFY_EMAIL",
      variables: {
        name: user.name,
        verificationUrl,
        appName: env.APP_NAME,
      },
    });

    return { message: "Verification email sent" };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await this.users.findByEmail(data.email);
    if (!user) {
      // Don't reveal if user exists or not
      return { message: "If the email exists, a password reset link has been sent" };
    }

    // Delete any existing password reset tokens
    await this.verificationRepo.deleteByUserId(user.id, TokenTypes.PASSWORD_RESET);

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    const resetData: NewVerificationToken = {
      token: resetToken,
      userId: user.id,
      type: TokenTypes.PASSWORD_RESET,
      expiresAt: getTokenExpiration(TokenTypes.PASSWORD_RESET),
    };

    await this.verificationRepo.create(resetData);

    // Send password reset email
    try {
      const resetUrl = generatePasswordResetUrl(resetToken);
      await this.emailService.sendEmail({
        to: user.email,
        template: "FORGOT_PASSWORD",
        variables: {
          name: user.name,
          resetUrl,
          appName: env.APP_NAME,
        },
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }

    return { message: "If the email exists, a password reset link has been sent" };
  }

  async resetPassword(token: string, data: ResetPasswordInput) {
    const resetToken = await this.verificationRepo.findByToken(token);

    if (!resetToken) {
      throw new Error(Errors.RESET_TOKEN_INVALID);
    }

    if (resetToken.used) {
      throw new Error(Errors.RESET_TOKEN_ALREADY_USED);
    }

    if (isTokenExpired(resetToken.expiresAt)) {
      throw new Error(Errors.RESET_TOKEN_EXPIRED);
    }

    if (resetToken.type !== TokenTypes.PASSWORD_RESET) {
      throw new Error(Errors.RESET_TOKEN_INVALID);
    }

    // Update password
    const hashedPassword = await hashPassword(data.newPassword);
    const user = await this.users.updatePassword(resetToken.userId, hashedPassword);

    if (!user) {
      throw new Error(Errors.USER_NOT_FOUND);
    }

    // Mark token as used
    await this.verificationRepo.markUsed(resetToken.id);

    // Revoke all existing refresh tokens for security
    // Note: This would require adding a method to revoke all tokens for a user
    // For now, we'll just mark the token as used

    // Send confirmation email
    try {
      const loginUrl = generateFrontendUrl("/login");
      await this.emailService.sendEmail({
        to: user.email,
        template: "RESET_PASSWORD",
        variables: {
          name: user.name,
          loginUrl,
          appName: env.APP_NAME,
        },
      });
    } catch (error) {
      console.error("Failed to send password reset confirmation email:", error);
    }

    return { message: "Password reset successfully" };
  }

  async logout(refreshToken: string) {
    try {
      const stored = await this.refreshRepo.find(refreshToken);
      if (stored && !stored.revoked) {
        await this.refreshRepo.revoke(stored.id);
      }
      return { message: "Logged out successfully" };
    } catch (error) {
      // Even if token is invalid, we consider logout successful
      return { message: "Logged out successfully" };
    }
  }

  private async generateTokens(userId: number, role?: string) {
    const access = generateAccessToken({ sub: userId, role });
    const refresh = generateRefreshToken({ sub: userId });

    const payload: NewRefreshToken = {
      token: refresh,
      userId,
      expiresAt: new Date(Date.now() + parseExpiration(env.REFRESH_TOKEN_EXPIRES_IN)),
    };

    await this.refreshRepo.create(payload);

    return {
      accessToken: access,
      refreshToken: refresh,
      expiresIn: parseExpiration(env.ACCESS_TOKEN_EXPIRES_IN) / 1000, // in seconds
    };
  }
}
