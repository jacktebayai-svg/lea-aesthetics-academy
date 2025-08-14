export class MASClient {
  constructor(private cfg: { baseUrl: string; token?: string }) {}
  private headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.cfg.token) h.Authorization = `Bearer ${this.cfg.token}`;
    return h;
  }
  async availability(params: { locationId: string; serviceId: string; from: string; to: string }) {
    const r = await fetch(`${this.cfg.baseUrl}/v1/availability?location_id=${params.locationId}&service_id=${params.serviceId}&from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}`, { headers: this.headers() });
    if (!r.ok) throw new Error(`availability failed: ${r.status}`);
    return r.json();
  }
  async createAppointment(payload: any) {
    const r = await fetch(`${this.cfg.baseUrl}/v1/appointments`, { method: 'POST', headers: this.headers(), body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`createAppointment failed: ${r.status}`);
    return r.json();
  }
  async generateDocument(payload: any) {
    const r = await fetch(`${this.cfg.baseUrl}/v1/documents/generate`, { method: 'POST', headers: this.headers(), body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`generateDocument failed: ${r.status}`);
    return r.json();
  }
}

