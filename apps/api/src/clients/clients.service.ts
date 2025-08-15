import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateClientDto {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  preferences?: any;
  tags?: string[];
}

export interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  preferences?: any;
  tags?: string[];
}

export interface CreateMedicalHistoryDto {
  clientId: string;
  data: any;
}

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClientDto) {
    // Check if client with email already exists for this tenant
    const existingClient = await this.prisma.client.findFirst({
      where: {
        tenantId: data.tenantId,
        email: data.email,
      },
    });

    if (existingClient) {
      throw new BadRequestException('Client with this email already exists for this tenant');
    }

    const client = await this.prisma.client.create({
      data: {
        tenantId: data.tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        preferences: data.preferences || {},
      },
    });

    return client;
  }

  async findAll(params: {
    tenantId: string;
    skip?: number;
    take?: number;
    cursor?: Prisma.ClientWhereUniqueInput;
    where?: Prisma.ClientWhereInput;
    orderBy?: Prisma.ClientOrderByWithRelationInput;
  }) {
    const { tenantId, skip, take, cursor, where, orderBy } = params;

    const whereClause: Prisma.ClientWhereInput = {
      tenantId,
      ...where,
    };

    return this.prisma.client.findMany({
      skip,
      take: take || 50,
      cursor,
      where: whereClause,
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async findByEmail(email: string, tenantId: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        tenantId,
        email,
      },
    });

    return client;
  }

  async update(id: string, tenantId: string, data: UpdateClientDto) {
    const client = await this.findById(id, tenantId);

    return this.prisma.client.update({
      where: { id },
      data: {
        firstName: data.firstName !== undefined ? data.firstName : client.firstName,
        lastName: data.lastName !== undefined ? data.lastName : client.lastName,
        email: data.email !== undefined ? data.email : client.email,
        phone: data.phone !== undefined ? data.phone : client.phone,
        preferences: data.preferences !== undefined ? data.preferences : client.preferences,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);

    return this.prisma.client.delete({
      where: { id },
    });
  }

  async search(tenantId: string, query: string) {
    const clients = await this.prisma.client.findMany({
      where: {
        tenantId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return clients;
  }

  async addMedicalHistory(data: CreateMedicalHistoryDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // For now, just return a simple response
    return { id: 'temp-id', clientId: data.clientId, data: data.data };
  }

  async getMedicalHistory(clientId: string, tenantId: string) {
    await this.findById(clientId, tenantId);
    return [];
  }

  async getLatestMedicalHistory(clientId: string, tenantId: string) {
    await this.findById(clientId, tenantId);
    return null;
  }

  async getClientTimeline(clientId: string, tenantId: string) {
    const client = await this.findById(clientId, tenantId);

    const appointments = await this.prisma.appointment.findMany({
      where: { clientId, tenantId },
      orderBy: { startTs: 'desc' },
    });

    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        appointmentId: {
          in: appointments.map(a => a.id),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      client,
      appointments,
      medicalHistory: [],
      payments,
    };
  }

  async addTags(clientId: string, tenantId: string, tags: string[]) {
    await this.findById(clientId, tenantId);
    // Tags functionality temporarily disabled
    return { id: clientId };
  }

  async removeTags(clientId: string, tenantId: string, tags: string[]) {
    await this.findById(clientId, tenantId);
    // Tags functionality temporarily disabled
    return { id: clientId };
  }

  async getClientsByTag(tenantId: string, tag: string) {
    // Tags functionality temporarily disabled
    return [];
  }

  async getClientStats(tenantId: string) {
    const totalClients = await this.prisma.client.count({
      where: { tenantId },
    });

    const newClientsThisMonth = await this.prisma.client.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const totalAppointments = await this.prisma.appointment.count({
      where: { tenantId },
    });

    const completedAppointments = await this.prisma.appointment.count({
      where: {
        tenantId,
        status: 'COMPLETED',
      },
    });

    return {
      totalClients,
      newClientsThisMonth,
      totalAppointments,
      completedAppointments,
    };
  }
}
