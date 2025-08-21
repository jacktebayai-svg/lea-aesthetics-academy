import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateClientDto {
  userId: string; // Link to user account
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
    // Check if client with email already exists
    const existingClient = await this.prisma.client.findFirst({
      where: {
        email: data.email,
      },
    });

    if (existingClient) {
      throw new BadRequestException('Client with this email already exists');
    }

    const client = await this.prisma.client.create({
      data: {
        userId: data.userId,
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
    skip?: number;
    take?: number;
    cursor?: Prisma.ClientWhereUniqueInput;
    where?: Prisma.ClientWhereInput;
    orderBy?: Prisma.ClientOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.client.findMany({
      skip,
      take: take || 50,
      cursor,
      where: where || {},
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async findByEmail(email: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        email,
      },
    });

    return client;
  }

  async update(id: string, data: UpdateClientDto) {
    const client = await this.findById(id);

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

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.client.delete({
      where: { id },
    });
  }

  async search(query: string) {
    const clients = await this.prisma.client.findMany({
      where: {
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

  async getMedicalHistory(clientId: string) {
    await this.findById(clientId);
    return [];
  }

  async getLatestMedicalHistory(clientId: string) {
    await this.findById(clientId);
    return null;
  }

  async getClientTimeline(clientId: string) {
    const client = await this.findById(clientId);

    const appointments = await this.prisma.appointment.findMany({
      where: { clientId },
      orderBy: { startTs: 'desc' },
    });

    const payments = await this.prisma.payment.findMany({
      where: {
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

  async addTags(clientId: string, tags: string[]) {
    await this.findById(clientId);
    // Tags functionality temporarily disabled
    return { id: clientId };
  }

  async removeTags(clientId: string, tags: string[]) {
    await this.findById(clientId);
    // Tags functionality temporarily disabled
    return { id: clientId };
  }

  async getClientsByTag(tag: string) {
    // Tags functionality temporarily disabled
    return [];
  }

  async getClientStats() {
    const totalClients = await this.prisma.client.count();

    const newClientsThisMonth = await this.prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const totalAppointments = await this.prisma.appointment.count();

    const completedAppointments = await this.prisma.appointment.count({
      where: {
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
