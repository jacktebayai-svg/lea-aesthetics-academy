import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateClientDto {
  tenantId: string;
  personal: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      postalCode: string;
      country: string;
    };
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  preferences?: {
    communicationPreferences?: string[];
    appointmentReminders?: boolean;
    marketingConsent?: boolean;
  };
  tags?: string[];
}

export interface UpdateClientDto {
  personal?: Partial<CreateClientDto['personal']>;
  preferences?: Partial<CreateClientDto['preferences']>;
  tags?: string[];
}

export interface CreateMedicalHistoryDto {
  clientId: string;
  data: {
    allergies?: string[];
    medications?: string[];
    medicalConditions?: string[];
    previousTreatments?: string[];
    contraindications?: string[];
    skinType?: string;
    notes?: string;
    consent?: {
      treatmentConsent: boolean;
      photographyConsent: boolean;
      dataProcessingConsent: boolean;
      consentDate: string;
    };
  };
}

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClientDto) {
    // Check if client with email already exists for this tenant
    const existingClients = await this.prisma.client.findMany({
      where: {
        tenantId: data.tenantId,
        personal: {
          path: ['email'],
          equals: data.personal.email,
        },
      },
    });

    if (existingClients.length > 0) {
      throw new BadRequestException('Client with this email already exists for this tenant');
    }

    const client = await this.prisma.client.create({
      data: {
        tenantId: data.tenantId,
        personal: data.personal,
        preferences: data.preferences || {},
        tags: data.tags || [],
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
    const clients = await this.prisma.client.findMany({
      where: {
        tenantId,
        personal: {
          path: ['email'],
          equals: email,
        },
      },
    });

    return clients.length > 0 ? clients[0] : null;
  }

  async update(id: string, tenantId: string, data: UpdateClientDto) {
    const client = await this.findById(id, tenantId);

    // Merge personal data
    const updatedPersonal = data.personal
      ? ({ ...(client.personal as Record<string, any>), ...(data.personal as Record<string, any>) } as Prisma.JsonValue)
      : client.personal;

    // Merge preferences
    const updatedPreferences = data.preferences
      ? ({ ...(client.preferences as Record<string, any>), ...(data.preferences as Record<string, any>) } as Prisma.JsonValue)
      : client.preferences;

    return this.prisma.client.update({
      where: { id },
      data: {
        personal: updatedPersonal as Prisma.InputJsonValue,
        preferences: updatedPreferences as Prisma.InputJsonValue,
        tags: data.tags !== undefined ? data.tags : client.tags,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const client = await this.findById(id, tenantId);

    // In a real app, you might want to soft delete or archive instead
    return this.prisma.client.delete({
      where: { id },
    });
  }

  async search(tenantId: string, query: string) {
    // Search clients by name, email, or phone
    const clients = await this.prisma.client.findMany({
      where: {
        tenantId,
        OR: [
          {
            personal: {
              path: ['firstName'],
              string_contains: query,
            },
          },
          {
            personal: {
              path: ['lastName'],
              string_contains: query,
            },
          },
          {
            personal: {
              path: ['email'],
              string_contains: query,
            },
          },
          {
            personal: {
              path: ['phone'],
              string_contains: query,
            },
          },
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

    // Get the latest version number
    const latestHistory = await this.prisma.medicalHistory.findFirst({
      where: { clientId: data.clientId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = latestHistory ? latestHistory.version + 1 : 1;

    return this.prisma.medicalHistory.create({
      data: {
        clientId: data.clientId,
        data: data.data,
        version: nextVersion,
      },
    });
  }

  async getMedicalHistory(clientId: string, tenantId: string) {
    // Verify client belongs to tenant
    const client = await this.findById(clientId, tenantId);

    return this.prisma.medicalHistory.findMany({
      where: { clientId },
      orderBy: { version: 'desc' },
    });
  }

  async getLatestMedicalHistory(clientId: string, tenantId: string) {
    // Verify client belongs to tenant
    const client = await this.findById(clientId, tenantId);

    return this.prisma.medicalHistory.findFirst({
      where: { clientId },
      orderBy: { version: 'desc' },
    });
  }

  async getClientTimeline(clientId: string, tenantId: string) {
    // Verify client belongs to tenant
    const client = await this.findById(clientId, tenantId);

    // Get appointments
    const appointments = await this.prisma.appointment.findMany({
      where: { clientId, tenantId },
      orderBy: { startTs: 'desc' },
    });

    // Get medical history
    const medicalHistory = await this.prisma.medicalHistory.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    // Get payments
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
      medicalHistory,
      payments,
    };
  }

  async addTags(clientId: string, tenantId: string, tags: string[]) {
    const client = await this.findById(clientId, tenantId);

    const currentTags = client.tags || [];
    const newTags = [...new Set([...currentTags, ...tags])];

    return this.prisma.client.update({
      where: { id: clientId },
      data: { tags: newTags },
    });
  }

  async removeTags(clientId: string, tenantId: string, tags: string[]) {
    const client = await this.findById(clientId, tenantId);

    const currentTags = client.tags || [];
    const updatedTags = currentTags.filter(tag => !tags.includes(tag));

    return this.prisma.client.update({
      where: { id: clientId },
      data: { tags: updatedTags },
    });
  }

  async getClientsByTag(tenantId: string, tag: string) {
    return this.prisma.client.findMany({
      where: {
        tenantId,
        tags: {
          has: tag,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
