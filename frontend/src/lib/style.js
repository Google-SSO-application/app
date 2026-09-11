// Converts a CSS declaration string like the ones used throughout the
// original template ("display:flex;gap:10px;...") into a React style object.
export function cssToObj(css) {
  if (!css) return {};
  const out = {};
  for (const decl of css.split(";")) {
    const trimmed = decl.trim();
    if (!trimmed) continue;
    const i = trimmed.indexOf(":");
    if (i === -1) continue;
    const prop = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (!prop || !value) continue;
    const key = prop.startsWith("--") ? prop : kebabToCamel(prop);
    out[key] = value;
  }
  return out;
}

function kebabToCamel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Merge any number of css strings / style objects into one React style object.
export function mergeStyle(...parts) {
  return Object.assign({}, ...parts.map((p) => (typeof p === "string" ? cssToObj(p) : p || {})));
}
