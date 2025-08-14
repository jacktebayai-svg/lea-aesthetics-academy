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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import {
  UsersService,
  CreateUserDto,
  UpdateUserDto,
  AssignRoleDto,
} from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @Put('me')
  async updateProfile(@Request() req, @Body() updateData: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateData);
  }

  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @HttpCode(HttpStatus.OK)
  @Post('me/change-password')
  async changePassword(
    @Request() req,
    @Body() body: { newPassword: string }
  ) {
    await this.usersService.changePassword(req.user.id, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Post()
  async create(@Body() createUserData: CreateUserDto) {
    return this.usersService.create(createUserData);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users list returned' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get()
  async findAll(
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
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.usersService.update(id, updateData);
  }

  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Post(':id/roles')
  async assignRole(
    @Param('id') userId: string,
    @Body() roleData: AssignRoleDto
  ) {
    return this.usersService.assignRole(userId, roleData);
  }

  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Delete(':userId/roles/:roleId')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string
  ) {
    return this.usersService.removeRole(userId, roleId);
  }

  @ApiOperation({ summary: 'Get users by tenant' })
  @ApiResponse({ status: 200, description: 'Tenant users returned' })
  @Get('tenant/:tenantId')
  async getUsersByTenant(@Param('tenantId') tenantId: string) {
    return this.usersService.getUsersByTenant(tenantId);
  }
}
