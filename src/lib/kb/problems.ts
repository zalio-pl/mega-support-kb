// The desk counts a report under the cause its tenant gives it (causes.ts), so a one-day move stays
// in `parser`. The desk also read those as a separate problem (desk-notes.json): `shift` counts them
// again, as a subset.
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'shift'];

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined, shifted: readonly string[]): ProblemGroup[] {
  const member: Record<Problem, (r: Report) => boolean> = {
    parser: (r) => causeOf(r, tenantOf(r)) === 'parser',
    hint: (r) => causeOf(r, tenantOf(r)) === 'hint',
    shift: (r) => shifted.includes(r.id),
  };
  return PROBLEMS.map((problem) => {
    const rs = reports.filter(member[problem]);
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
  }).filter((g) => g.reports.length > 0);
}
