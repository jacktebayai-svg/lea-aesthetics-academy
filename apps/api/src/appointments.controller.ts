import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Logger,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { PolicyService } from './policy.service';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';
import {
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  ListAppointmentsQuerySchema,
  AppointmentParamsSchema,
  CancelAppointmentSchema,
  RescheduleAppointmentSchema,
} from './appointments/appointments.schemas';
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  ListAppointmentsQuery,
  AppointmentParams,
  CancelAppointmentRequest,
  RescheduleAppointmentRequest,
} from './appointments/appointments.schemas';
// Removed TenantId decorator for single-tenant architecture
import { PaginatedResponse } from './common/schemas/common.schemas';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('v1/appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(
    private prisma: PrismaService,
    private policy: PolicyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List appointments with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @UsePipes(new ZodValidationPipe(ListAppointmentsQuerySchema))
  async list(
    @Query() query: ListAppointmentsQuery,
  ): Promise<PaginatedResponse<any>> {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const offset = (page - 1) * limit;

    // Build where clause with filters (no tenant isolation needed)
    const where: any = {
      ...filters,
    };

    // Date range filtering
    if (query.dateFrom || query.dateTo) {
      where.startTs = {};
      if (query.dateFrom) where.startTs.gte = new Date(query.dateFrom);
      if (query.dateTo) where.startTs.lte = new Date(query.dateTo);
    }

    // Exclude completed appointments unless explicitly requested
    if (!query.includeCompleted) {
      where.status = { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] };
    }

    const [appointments, totalCount] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { id: 'desc' },
        // TODO: Re-add includes when Prisma schema issues are resolved
      }),
      this.prisma.appointment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: appointments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @UsePipes(new ZodValidationPipe(AppointmentParamsSchema))
  async findOne(
    @Param() params: AppointmentParams,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: params.id,
      },
      // TODO: Re-add includes when Prisma schema issues are resolved
    });

    if (!appointment) {
      throw new HttpException(
        'Appointment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return appointment;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid appointment data' })
  @ApiResponse({ status: 409, description: 'Time slot conflict or practitioner unavailable' })
  @UsePipes(new ZodValidationPipe(CreateAppointmentSchema))
  async create(
    @Body() createData: CreateAppointmentRequest,
  ) {
    this.logger.log(`Creating appointment`);

    // Validate service exists and is active
    const service = await this.prisma.service.findFirst({
      where: {
        id: createData.serviceId,
        isActive: true,
      },
    });

    if (!service) {
      throw new HttpException(
        'Service not found or inactive',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate practitioner exists and is available
    const practitioner = await this.prisma.user.findFirst({
      where: {
        id: createData.practitionerId,
        role: { in: ['ADMIN'] }, // In single-tenant, ADMIN can be practitioners
        isActive: true,
      },
    });

    if (!practitioner) {
      throw new HttpException(
        'Practitioner not found or not authorized',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check for time slot conflicts
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        practitionerId: createData.practitionerId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          {
            startTs: {
              lt: new Date(createData.endTs),
            },
            endTs: {
              gt: new Date(createData.startTs),
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new HttpException(
        'Time slot conflicts with existing appointment',
        HttpStatus.CONFLICT,
      );
    }

    // Get current policy version (TODO: implement tenant-specific policies)
    const policyVersion = 1;

    // Get the business profile
    const businessProfile = await this.prisma.businessProfile.findFirst();
    if (!businessProfile) {
      throw new HttpException(
        'Business profile not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Create the appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: createData.clientId,
        practitionerId: createData.practitionerId,
        serviceId: createData.serviceId,
        businessProfileId: businessProfile.id,
        startTs: new Date(createData.startTs),
        endTs: new Date(createData.endTs),
        notes: createData.notes,
        status: 'SCHEDULED',
        policyVersion,
      },
      include: {
        client: true,
        practitioner: true,
        service: true,
        businessProfile: true,
      },
    });

    // Create audit log entry (instead of event model)
    await this.prisma.auditLog.create({
      data: {
        userId: createData.clientId,
        action: 'create',
        entityType: 'Appointment',
        entityId: appointment.id,
        changes: {
          serviceId: createData.serviceId,
          practitionerId: createData.practitionerId,
          startTime: createData.startTs,
          endTime: createData.endTs,
        },
      },
    });

    this.logger.log(`Appointment created successfully: ${appointment.id}`);

    return appointment;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Time slot conflict' })
  @UsePipes(new ZodValidationPipe(UpdateAppointmentSchema))
  async update(
    @Param() params: AppointmentParams,
    @Body() updateData: UpdateAppointmentRequest,
  ) {
    // Verify appointment exists
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!existingAppointment) {
      throw new HttpException(
        'Appointment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if appointment can be modified
    if (existingAppointment.status === 'COMPLETED') {
      throw new HttpException(
        'Cannot modify completed appointment',
        HttpStatus.BAD_REQUEST,
      );
    }

    // If updating time slots, check for conflicts
    if (updateData.startTs && updateData.endTs && updateData.practitionerId) {
      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          id: { not: params.id }, // Exclude current appointment
          practitionerId: updateData.practitionerId,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          OR: [
            {
              startTs: {
                lt: new Date(updateData.endTs),
              },
              endTs: {
                gt: new Date(updateData.startTs),
              },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        throw new HttpException(
          'Time slot conflicts with existing appointment',
          HttpStatus.CONFLICT,
        );
      }
    }

    // Update the appointment
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...updateData,
        startTs: updateData.startTs ? new Date(updateData.startTs) : undefined,
        endTs: updateData.endTs ? new Date(updateData.endTs) : undefined,
      },
      // TODO: Re-add includes when Prisma schema issues are resolved
    });

    this.logger.log(`Appointment updated: ${params.id}`);

    return updatedAppointment;
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @UsePipes(new ZodValidationPipe(CancelAppointmentSchema))
  async cancel(
    @Param() params: AppointmentParams,
    @Body() cancelData: CancelAppointmentRequest,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!appointment) {
      throw new HttpException(
        'Appointment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (appointment.status === 'CANCELLED') {
      throw new HttpException(
        'Appointment is already cancelled',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cancelledAppointment = await this.prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        notes: cancelData.notes
          ? `${appointment.notes || ''}\n\nCancellation: ${cancelData.notes}`
          : appointment.notes,
      },
    });

    // Create audit log entry for cancellation
    await this.prisma.auditLog.create({
      data: {
        userId: appointment.clientId,
        action: 'update',
        entityType: 'Appointment',
        entityId: params.id,
        changes: {
          status: 'CANCELLED',
          reason: cancelData.reason,
          refundRequested: cancelData.refundRequested,
        },
      },
    });

    this.logger.log(`Appointment cancelled: ${params.id}`);

    return cancelledAppointment;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment (hard delete)' })
  @ApiResponse({ status: 204, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async delete(
    @Param() params: AppointmentParams,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!appointment) {
      throw new HttpException(
        'Appointment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Only allow deletion of pending deposit or cancelled appointments
    if (!['PENDING_DEPOSIT', 'CANCELLED'].includes(appointment.status)) {
      throw new HttpException(
        'Only pending or cancelled appointments can be deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.appointment.delete({
      where: { id: params.id },
    });

    this.logger.log(`Appointment deleted: ${params.id}`);

    return { message: 'Appointment deleted successfully' };
  }
}
