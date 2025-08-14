import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('v1/documents')
export class DocumentsController {
  constructor(private prisma: PrismaService) {}

  @Post('generate')
  async generate(@Body() body: any) {
    const {
      tenantId = 'tn_demo',
      clientId = null,
      type = 'consent',
      content = { blocks: [] },
    } = body;
    const doc = await this.prisma.document.create({
      data: {
        tenantId,
        clientId,
        type,
        content,
        version: 'v0',
        locked: false,
      },
    });
    return {
      documentId: doc.id,
      version: doc.version,
      stampHash: null,
      url: `/documents/${doc.id}.pdf`,
    };
  }
}
