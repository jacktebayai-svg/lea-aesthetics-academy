import { Controller, Get } from '@nestjs/common';
import { Public } from './common/auth/public.decorator';

@Controller('healthz')
export class HealthController {
  @Public()
  @Get()
  get() {
    return { ok: true };
  }
}
