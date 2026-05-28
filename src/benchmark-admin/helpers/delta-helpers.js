export function dimStatus(b, p) {
  const bNull = b === null || b === undefined || b.error != null;
  const pNull = p === null || p === undefined || p.error != null;
  if (bNull && pNull)  return 'null_both';
  if (bNull)           return 'null_baseline';
  if (pNull)           return 'null_postAgent';
  return 'compared';
}

export function numericDelta(bVal, pVal) {
  if (bVal == null || pVal == null) return { baseline: bVal ?? null, postAgent: pVal ?? null, delta: null };
  return { baseline: bVal, postAgent: pVal, delta: pVal - bVal };
}

export function diffDimension(bDim, pDim, numericKeys) {
  const status = dimStatus(bDim, pDim);
  if (status !== 'compared') {
    return {
      status,
      baselineError:  bDim?.error ?? null,
      postAgentError: pDim?.error ?? null,
    };
  }

  const out = { status };
  for (const key of numericKeys) {
    out[key] = numericDelta(bDim[key], pDim[key]);
  }
  return out;
}
