import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantAls } from './tenant.context';
import { TENANT_PROP } from './tenant.constants';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const tenantId: string | undefined = req[TENANT_PROP];
    return tenantAls.run({ tenantId }, () => next.handle());
  }
}
