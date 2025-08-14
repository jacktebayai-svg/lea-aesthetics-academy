import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
