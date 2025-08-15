import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/tenant/tenant.guard';
import { PermissionsGuard } from '../common/auth/permissions.guard';
import { RequirePermissions } from '../common/auth/permissions.decorator';
import { UsersService } from './users.service';
import type { CreateUserDto, UpdateUserDto, AssignRoleDto } from './users.service';
import { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('v1/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @Get('me')
  async getProfile(@Request() req: { user: AuthUser }) {
    return this.usersService.getProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @Put('me')
  async updateProfile(@Request() req: { user: AuthUser }, @Body() updateData: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateData);
  }

  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @HttpCode(HttpStatus.OK)
  @Post('me/change-password')
  async changePassword(
    @Request() req: { user: AuthUser },
    @Body() body: { newPassword: string }
  ) {
    await this.usersService.changePassword(req.user.id, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @RequirePermissions('user:manage')
  @Post()
  async create(
    @Body() createUserData: CreateUserDto,
    @Request() req: { user: AuthUser }
  ) {
    this.logger.log('Creating user', {
      email: createUserData.email,
      tenantId: req.user.tenantId,
    });
    return this.usersService.create(createUserData);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users list returned' })
  @RequirePermissions('user:read', 'user:manage')
  @Get()
  async findAll(
    @Request() req: { user: AuthUser },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
    @Query('tenantId') tenantId?: string
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tenantId) {
      where.roles = {
        some: { tenantId },
      };
    }

    return this.usersService.findAll({
      skip,
      take,
      where,
    });
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @RequirePermissions('user:read', 'user:manage')
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: { user: AuthUser }) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @RequirePermissions('user:manage')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
    @Request() req: { user: AuthUser }
  ) {
    // TODO: Add role update validation when UpdateUserDto includes role field
    return this.usersService.update(id, updateData);
  }

  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @RequirePermissions('user:manage')
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: { user: AuthUser }
  ) {
    // Prevent users from deactivating themselves
    if (id === req.user.id) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }
    return this.usersService.delete(id);
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @RequirePermissions('user:manage')
  @Post(':id/roles')
  async assignRole(
    @Param('id') userId: string,
    @Body() roleData: AssignRoleDto,
    @Request() req: { user: AuthUser }
  ) {
    this.logger.log('Assigning role', {
      userId,
      role: roleData.role,
      tenantId: req.user.tenantId,
    });
    return this.usersService.assignRole(userId, roleData);
  }

  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @RequirePermissions('user:manage')
  @Delete(':userId/roles/:roleId')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Request() req: { user: AuthUser }
  ) {
    this.logger.log('Removing role', {
      userId,
      roleId,
      tenantId: req.user.tenantId,
    });
    return this.usersService.removeRole(userId, roleId);
  }

  @ApiOperation({ summary: 'Get users by tenant' })
  @ApiResponse({ status: 200, description: 'Tenant users returned' })
  @RequirePermissions('user:read', 'user:manage')
  @Get('tenant/:tenantId')
  async getUsersByTenant(
    @Param('tenantId') tenantId: string,
    @Request() req: { user: AuthUser }
  ) {
    // Only allow users to get users from their own tenant unless they're system admin
    if (tenantId !== req.user.tenantId && !req.user.permissions.includes('system:admin')) {
      throw new ForbiddenException('Cannot access users from other tenants');
    }
    return this.usersService.getUsersByTenant(tenantId);
  }
}
