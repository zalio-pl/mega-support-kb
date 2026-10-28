// causes.ts places every report by tenant, so a one-day move lands under `parser`. The desk's own
// reading (desk-notes.json) says otherwise: no swap, a different bug.
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'shift'];

export function problemOf(r: Report, t: Tenant | undefined, shifted: readonly string[]): Problem | null {
  return shifted.includes(r.id) ? 'shift' : causeOf(r, t);
}

export type ProblemGroup = { problem: Problem | 'unplaced'; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined, shifted: readonly string[]): ProblemGroup[] {
  const order: ProblemGroup['problem'][] = [...PROBLEMS, 'unplaced'];
  return order
    .map((problem) => {
      const rs = reports.filter((r) => (problemOf(r, tenantOf(r), shifted) ?? 'unplaced') === problem);
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .filter((g) => g.reports.length > 0);
}
