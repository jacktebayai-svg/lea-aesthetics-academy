import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { Prisma, Role } from '@prisma/client';

export interface CreateUserDto {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: {
    tenantId: string;
    role: Role;
    locationId?: string;
  }[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface AssignRoleDto {
  tenantId: string;
  role: Role;
  locationId?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(data: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    let hashedPassword: string | null = null;
    if (data.password) {
      hashedPassword = await this.authService.hashPassword(data.password);
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      include: {
        roles: true,
      },
    });

    // Assign roles if provided
    if (data.roles && data.roles.length > 0) {
      await Promise.all(
        data.roles.map((roleData) =>
          this.prisma.userRole.create({
            data: {
              userId: user.id,
              tenantId: roleData.tenantId,
              role: roleData.role,
              locationId: roleData.locationId,
            },
          })
        )
      );
    }

    // Fetch user with roles
    return this.findById(user.id);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.user.findMany({
      skip,
      take: take || 50,
      cursor,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        roles: true,
        _count: {
          select: {
            refreshTokens: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
        practitioner: true,
        _count: {
          select: {
            refreshTokens: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
        practitioner: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        roles: true,
      },
    });
  }

  async delete(id: string) {
    const user = await this.findById(id);

    // Soft delete by deactivating user
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignRole(userId: string, roleData: AssignRoleDto) {
    const user = await this.findById(userId);

    // Check if role already exists
    const existingRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        tenantId: roleData.tenantId,
        role: roleData.role,
      },
    });

    if (existingRole) {
      throw new ConflictException('User already has this role for this tenant');
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        tenantId: roleData.tenantId,
        role: roleData.role,
        locationId: roleData.locationId,
      },
    });
  }

  async removeRole(userId: string, roleId: string) {
    const role = await this.prisma.userRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.userId !== userId) {
      throw new BadRequestException('Role does not belong to this user');
    }

    return this.prisma.userRole.delete({
      where: { id: roleId },
    });
  }

  async getUsersByTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            tenantId,
          },
        },
        isActive: true,
      },
      include: {
        roles: {
          where: {
            tenantId,
          },
        },
      },
    });
  }

  async changePassword(userId: string, newPassword: string) {
    const hashedPassword = await this.authService.hashPassword(newPassword);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async verifyEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    
    // Remove sensitive data
    const { password, ...profile } = user;
    return profile;
  }
}
