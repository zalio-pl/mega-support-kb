<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket, issues, states, repo }: { ticket: number; issues: Record<Problem, number>; states: Record<Problem, string>; repo: string } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(rows));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} ({rows.length - merged.length} duplicate export rows dropped) ·
  <strong>{groups.length}</strong> problems
</p>
<p class="note"><code>shift</code> reports are also counted under the cause their tenant gives them, as the desk counts them.</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr></thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td><a href="{repo}/issues/{issues[g.problem]}">#{issues[g.problem]}</a></td>
        <td>{states[g.problem]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
