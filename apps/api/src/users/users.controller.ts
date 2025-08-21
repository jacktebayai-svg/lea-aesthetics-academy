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
import type { CreateUserDto, UpdateUserDto } from './users.service';
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

  // Role management removed for single-tenant architecture
  // Roles are managed directly on the User model
}
