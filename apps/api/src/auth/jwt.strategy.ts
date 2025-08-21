import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;        // User ID (Auth0 user_id)
  email: string;      // User email
  email_verified?: boolean;
  iat?: number;       // Issued at
  exp?: number;       // Expiration
  aud?: string;       // Audience
  iss?: string;       // Issuer
  // Custom claims
  'custom:tenant_id'?: string;
  'custom:role'?: string;
  'custom:permissions'?: string[];
}

export interface AuthUser {
  id: string;         // Internal user ID
  email: string;
  role: string;
  permissions: string[];
  emailVerified: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const issuer = configService.get<string>('AUTH0_ISSUER');
    const audience = configService.get<string>('AUTH0_AUDIENCE');
    
    let strategyConfig: any;

    if (issuer && audience) {
      // Auth0 JWKS mode for production
      try {
        const jwksRsa = require('jwks-rsa');
        strategyConfig = {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `${issuer}.well-known/jwks.json`,
          }),
          issuer,
          audience,
          algorithms: ['RS256'],
        };
      } catch (error) {
        throw new Error('Failed to initialize Auth0 JWKS. Install jwks-rsa: npm install jwks-rsa');
      }
    } else {
      // Development mode with JWT_SECRET
      const secret = configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET is required for development mode');
      }
      strategyConfig = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: secret,
        algorithms: ['HS256'],
      };
    }

    super(strategyConfig);
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    this.logger.debug('JWT validation started', {
      sub: payload.sub,
      email: payload.email,
    });

    try {
      // Find user by ID from JWT payload
      let user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      // If user doesn't exist and this is an Auth0 token, try to find by email
      if (!user && payload.email) {
        user = await this.prisma.user.findUnique({
          where: { email: payload.email },
        });
      }

      // If user doesn't exist and email is verified, create them (first-time login)
      if (!user && payload.email_verified) {
        this.logger.log('Creating new user from JWT payload', {
          email: payload.email,
        });

        const role = (payload['custom:role'] as any) || 'CLIENT';

        user = await this.prisma.user.create({
          data: {
            email: payload.email,
            emailVerified: payload.email_verified || false,
            isActive: true,
            role,
          },
        });

        this.logger.log('User created successfully', {
          id: user!.id,
          email: user!.email,
          role,
        });
      }

      if (!user) {
        throw new UnauthorizedException('User not found and email not verified');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Extract permissions from custom claims or default based on role
      const permissions = payload['custom:permissions'] || this.getDefaultPermissions(user.role);

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions,
        emailVerified: user.emailVerified,
      };

      this.logger.debug('JWT validation successful', {
        userId: authUser.id,
        role: authUser.role,
        permissions: authUser.permissions.length,
      });

      return authUser;
    } catch (error) {
      this.logger.error('JWT validation failed', {
        error: error.message,
        sub: payload.sub,
        email: payload.email,
      });
      throw new UnauthorizedException('Invalid token or user data');
    }
  }


  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      ADMIN: [
        'business:manage',
        'user:manage',
        'appointment:create',
        'appointment:read',
        'appointment:update',
        'appointment:delete',
        'service:manage',
        'client:manage',
        'payment:manage',
        'document:manage',
        'course:manage',
        'student:manage',
      ],
      CLIENT: [
        'appointment:read',
        'appointment:create',
        'document:read',
        'profile:update',
      ],
      STUDENT: [
        'course:read',
        'enrollment:read',
        'assessment:take',
        'certificate:read',
        'profile:update',
      ],
    };

    return rolePermissions[role] || rolePermissions.CLIENT;
  }
}
