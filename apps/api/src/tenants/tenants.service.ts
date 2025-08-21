// Single-tenant architecture - tenant service disabled
/*
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    // Implementation will go here
    return this.prisma.tenant.create({ data: createTenantDto });
  }
}
*/
