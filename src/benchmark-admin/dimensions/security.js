import { nullDimension, adminBin, tryRun } from '../helpers/utils.js';

export function runSecurity({ srcDir, adminDir, adminBins }) {
  const keys = ['totalFindingCount', 'bySeverity', 'findings'];

  try {
    const semgrepBin = adminBin(adminBins, 'semgrep');
    const configs    = ['p/typescript', 'p/javascript', 'p/react', 'p/express']
      .map(c => `--config ${c}`)
      .join(' ');

    const result = tryRun(
      `"${semgrepBin}" scan ${configs} --json --no-rewrite-rule-ids "${srcDir}"`,
      adminDir,
    );

    // semgrep exits 0 (no findings) or 1 (findings found) — both produce valid JSON on stdout.
    // If stdout is empty the binary wasn't found or crashed before producing output.
    if (!result.stdout) {
      const hint = result.stderr.slice(0, 200) || 'binary not found or produced no output';
      return nullDimension(keys, `semgrep unavailable: ${hint}`);
    }

    let parsed;
    try {
      parsed = JSON.parse(result.stdout);
    } catch {
      const hint = result.stderr.slice(0, 200) || result.stdout.slice(0, 200);
      return nullDimension(keys, `semgrep JSON parse failed: ${hint}`);
    }

    const rawFindings = parsed.results || [];
    const bySeverity  = {};
    const findings    = rawFindings.map(f => {
      const sev = f.extra?.severity ?? 'UNKNOWN';
      bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
      return {
        ruleId:   f.check_id,
        severity: sev,
        file:     f.path,
        line:     f.start?.line,
        message:  f.extra?.message,
      };
    });

    return { error: null, totalFindingCount: findings.length, bySeverity, findings };
  } catch (e) {
    return nullDimension(keys, String(e.message));
  }
}
