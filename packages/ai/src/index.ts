export type CopyInput = { profile: any; services: any[]; city: string; tone: "luxury" | "clinical" };
export type CopyOutput = { hero: string; bullets: string[]; metaTitle: string; metaDescription: string };
export type PricingInput = { service: string; postcode: string; base: number };
export type PricingOutput = { suggested: number; p25: number; p50: number; p75: number };
export type RiskInput = { medical: any; treatment: string };
export type RiskFlag = { code: string; severity: "low" | "med" | "high"; note: string };
export type RiskOutput = { flags: RiskFlag[] };
export type DocCheckInput = { template: any; context: any; mandatory: string[] };
export type DocCheckOutput = { ok: boolean; missing: string[] };

export function checkDoc(input: DocCheckInput): DocCheckOutput {
  const missing = input.mandatory.filter((id) => !JSON.stringify(input.template).includes(id));
  return { ok: missing.length === 0, missing };
}

