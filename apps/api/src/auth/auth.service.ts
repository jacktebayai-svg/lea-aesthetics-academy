import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
interface JwtPayloadForLogin {
  sub: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: any[];
  };
  accessToken: string;
  refreshToken: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return null;
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set. Please use OAuth login.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any): Promise<LoginResponse> {
    const payload: JwtPayloadForLogin = {
      sub: user.id,
      email: user.email,
      roles: [user.role],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [user.role],
      },
      accessToken,
      refreshToken,
    };
  }

  async register(userData: CreateUserData): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        emailVerified: false,
        role: (userData.role as any) || 'CLIENT',
      },
    });

    return this.login(user);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Check if token exists in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          user: true,
        },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const newPayload: JwtPayloadForLogin = {
        sub: storedToken.user.id,
        email: storedToken.user.email,
        roles: [storedToken.user.role],
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success message even if user doesn't exist for security
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password_reset' },
      { 
        secret: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        expiresIn: '15m' // 15 minutes expiry
      }
    );

    // Store reset token in database (you may want to add a PasswordReset model)
    // For now, we'll store in user metadata
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        metadata: {
          ...((user.metadata as any) || {}),
          passwordResetToken: resetToken,
          passwordResetExpiry: new Date(Date.now() + 15 * 60 * 1000),
        },
      },
    });

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
      });

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid reset token');
      }

      const metadata = (user.metadata as any) || {};
      const storedToken = metadata.passwordResetToken;
      const tokenExpiry = metadata.passwordResetExpiry;

      if (!storedToken || storedToken !== token || new Date(tokenExpiry) < new Date()) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          metadata: {
            ...metadata,
            passwordResetToken: null,
            passwordResetExpiry: null,
          },
        },
      });

      // Invalidate all refresh tokens for security
      await this.logoutAll(user.id);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async setup2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    // TODO: Implement 2FA setup with speakeasy or similar
    // This is a placeholder - implement with proper 2FA library
    const secret = 'placeholder-2fa-secret';
    const qrCode = 'placeholder-qr-code-url';
    
    // Store 2FA secret in user metadata
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...((await this.prisma.user.findUnique({ where: { id: userId } }))?.metadata as any || {}),
          twoFactorSecret: secret,
          twoFactorEnabled: false, // Will be enabled after verification
        },
      },
    });

    return { secret, qrCode };
  }

  async verify2FA(userId: string, token: string): Promise<{ success: boolean }> {
    // TODO: Implement 2FA verification with speakeasy or similar
    // This is a placeholder
    const isValid = token === '123456'; // Placeholder validation
    
    if (isValid) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            ...((await this.prisma.user.findUnique({ where: { id: userId } }))?.metadata as any || {}),
            twoFactorEnabled: true,
          },
        },
      });
    }

    return { success: isValid };
  }

  async disable2FA(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...((await this.prisma.user.findUnique({ where: { id: userId } }))?.metadata as any || {}),
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      },
    });

    return { message: '2FA disabled successfully' };
  }

  async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
