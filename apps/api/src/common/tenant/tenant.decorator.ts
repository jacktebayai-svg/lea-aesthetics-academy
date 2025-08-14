import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TENANT_PROP } from './tenant.constants';

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req[TENANT_PROP];
  },
);

