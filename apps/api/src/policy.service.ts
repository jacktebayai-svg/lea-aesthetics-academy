import { Injectable } from '@nestjs/common';

export type PolicyConfig = {
  deposit: { type: 'percent' | 'fixed'; value: number; min?: number; max?: number };
  cancellation: { windowHours: number; feePercent: number };
  noShow: { feePercent: number };
  buffers?: { beforeMin?: number; afterMin?: number };
};

export type PolicyInput = {
  now: Date;
  apptStart: Date;
  servicePriceCents: number;
  action: 'cancel' | 'reschedule';
};

export type PolicyResult = { feeCents: number; allowed: boolean; policyVersion: number };

@Injectable()
export class PolicyService {
  evaluate(input: PolicyInput, cfg: PolicyConfig): PolicyResult {
    const msUntil = input.apptStart.getTime() - input.now.getTime();
    const hoursUntil = msUntil / 36e5;
    let feeCents = 0;
    let allowed = true;

    if (input.action === 'cancel') {
      if (hoursUntil < cfg.cancellation.windowHours) {
        feeCents = Math.round((cfg.cancellation.feePercent / 100) * input.servicePriceCents);
      }
    }

    return { feeCents, allowed, policyVersion: 1 };
  }
}
