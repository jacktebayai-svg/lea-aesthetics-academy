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
  role?: Role;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
  emailVerified?: boolean;
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
        role: data.role || 'CLIENT',
      },
      include: {
        client: true,
        student: true,
        practitioner: true,
      },
    });

    return user;
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
        client: true,
        student: true,
        practitioner: true,
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
        client: true,
        student: true,
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
        client: true,
        student: true,
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
        client: true,
        student: true,
        practitioner: true,
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

  async updateRole(userId: string, role: Role) {
    const user = await this.findById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: {
        client: true,
        student: true,
        practitioner: true,
      },
    });
  }

  async getUsersByRole(role: Role) {
    return this.prisma.user.findMany({
      where: {
        role,
        isActive: true,
      },
      include: {
        client: true,
        student: true,
        practitioner: true,
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
