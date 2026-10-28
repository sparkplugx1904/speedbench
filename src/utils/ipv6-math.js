/**
 * IPv6 parsing and classification, computed offline with BigInt.
 * Handles RFC 4291 text form: hextets, double-colon compression and the
 * embedded dotted-quad tail (e.g. ::ffff:192.168.1.5).
 */

const HEX_RE = /^[0-9a-f]+$/i;
const V4_TAIL_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

const H = (hex) => BigInt(`0x${hex}`);

function parseV4Tail(text) {
  const m = V4_TAIL_RE.exec(text);
  if (!m) return null;
  const octets = m.slice(1).map(Number);
  if (octets.some((n) => n > 255)) return null;
  return (
    (BigInt(octets[0]) << 24n) |
    (BigInt(octets[1]) << 16n) |
    (BigInt(octets[2]) << 8n) |
    BigInt(octets[3])
  );
}

export function parseIpv6(rawInput) {
  const input = (rawInput ?? "").trim();
  if (!input) return { ok: false, error: "Enter an IPv6 address." };

  // Accept an optional trailing prefix; classification uses the address only.
  const address = input.split("/")[0].trim();
  if (!address) return { ok: false, error: "Enter an IPv6 address." };

  if (/[^0-9A-Fa-f:.]/.test(address)) {
    return { ok: false, error: "IPv6 uses hex groups and colons only." };
  }

  const pieces = address.split("::");
  if (pieces.length > 2) {
    return { ok: false, error: '"::" can appear only once.' };
  }

  let head = pieces[0] ? pieces[0].split(":") : [];
  let tail = pieces.length === 2 && pieces[1] ? pieces[1].split(":") : [];

  // An embedded dotted-quad tail counts as the last two hextets.
  let v4Value = null;
  if (tail.length && V4_TAIL_RE.test(tail[tail.length - 1])) {
    v4Value = parseV4Tail(tail.pop());
    if (v4Value === null)
      return { ok: false, error: "Invalid embedded IPv4 tail." };
  } else if (head.length && V4_TAIL_RE.test(head[head.length - 1])) {
    v4Value = parseV4Tail(head.pop());
    if (v4Value === null)
      return { ok: false, error: "Invalid embedded IPv4 tail." };
  }

  const groups = [...head, ...tail].map((group) => {
    if (!group || group.length > 4 || !HEX_RE.test(group)) return null;
    return parseInt(group, 16);
  });
  if (groups.some((n) => n === null)) {
    return { ok: false, error: "Every colon group must hold 1-4 hex digits." };
  }

  const v4Slots = v4Value === null ? 0 : 2;
  const explicitCount = groups.length + v4Slots;
  if (pieces.length === 2) {
    if (explicitCount > 8) {
      return { ok: false, error: "Too many groups for a compressed address." };
    }
  } else if (explicitCount !== 8) {
    return {
      ok: false,
      error: "An IPv6 address needs 8 groups, or 6 plus an IPv4 tail.",
    };
  }

  const hextets = groups.slice(0, head.length);
  if (pieces.length === 2) {
    for (let i = 0; i < 8 - explicitCount; i++) hextets.push(0);
  }
  hextets.push(...groups.slice(head.length));
  if (v4Value !== null) {
    hextets.push(Number((v4Value >> 16n) & 0xffffn));
    hextets.push(Number(v4Value & 0xffffn));
  }

  let value = 0n;
  for (const hextet of hextets) value = (value << 16n) | BigInt(hextet);

  return { ok: true, value, hasV4Tail: v4Value !== null };
}

/** RFC 5952 canonical form: lowercase, longest zero run compressed once. */
export function formatIpv6Canonical(value) {
  const hextets = [];
  for (let i = 0; i < 8; i++) {
    hextets.push(((value >> BigInt((7 - i) * 16)) & 0xffffn).toString(16));
  }
  let bestStart = -1;
  let bestLen = 0;
  let runStart = -1;
  for (let i = 0; i < 8; i++) {
    if (hextets[i] !== "0") {
      if (runStart !== -1 && i - runStart > bestLen) {
        bestStart = runStart;
        bestLen = i - runStart;
      }
      runStart = -1;
    } else if (runStart === -1) {
      runStart = i;
    }
  }
  if (runStart !== -1 && 8 - runStart > bestLen) {
    bestStart = runStart;
    bestLen = 8 - runStart;
  }

  if (bestLen < 2) return hextets.join(":");
  const head = hextets.slice(0, bestStart).join(":");
  const tail = hextets.slice(bestStart + bestLen).join(":");
  if (head.length === 0 && tail.length === 0) return "::";
  if (head.length === 0) return `::${tail}`;
  if (tail.length === 0) return `${head}::`;
  return `${head}::${tail}`;
}

export function formatIpv6Expanded(value) {
  const hextets = [];
  for (let i = 0; i < 8; i++) {
    hextets.push(
      ((value >> BigInt((7 - i) * 16)) & 0xffffn).toString(16).padStart(4, "0"),
    );
  }
  return hextets.join(":");
}

function ipv4FromLow32(value) {
  const low = value & 0xffffffffn;
  return [24n, 16n, 8n, 0n]
    .map((s) => ((low >> s) & 255n).toString(10))
    .join(".");
}

/**
 * True when the top `prefixLen` bits equal `hiBits` (given already
 * right-aligned inside those bits, e.g. 0x3FE for fe80::/10).
 */
function hasPrefix(value, hiBits, prefixLen) {
  return value >> BigInt(128 - prefixLen) === hiBits;
}

// hiBits = the first `prefixLen` bits as an integer.
const ROUTES = [
  {
    scope: "NAT64 translation",
    kind: "Transition",
    prefixLen: 96,
    hiBits: H("64ff9b") << 64n,
  },
  {
    scope: "IPv4-mapped",
    kind: "Transition",
    prefixLen: 96,
    hiBits: H("ffff"),
  },
  {
    scope: "Reserved (deprecated ::/96)",
    kind: "Special",
    prefixLen: 96,
    hiBits: 0n,
  },
  {
    scope: "Documentation",
    kind: "Special",
    prefixLen: 32,
    hiBits: H("20010db8"),
  },
  {
    scope: "Teredo tunneling",
    kind: "Transition",
    prefixLen: 32,
    hiBits: H("20010000"),
  },
  {
    scope: "6to4 tunneling",
    kind: "Transition",
    prefixLen: 16,
    hiBits: H("2002"),
  },
  { scope: "Multicast", kind: "Multicast", prefixLen: 8, hiBits: H("ff") },
  { scope: "Link-local", kind: "Private", prefixLen: 10, hiBits: H("3fa") },
  { scope: "Unique local", kind: "Private", prefixLen: 7, hiBits: H("7e") },
  { scope: "Global unicast", kind: "Public unicast", prefixLen: 3, hiBits: 1n },
];

export function classifyIpv6(value) {
  let route;
  if (value === 0n) {
    route = { scope: "Unspecified", kind: "Special" };
  } else if (value === 1n) {
    route = { scope: "Loopback", kind: "Special" };
  } else {
    route = ROUTES.find((r) => hasPrefix(value, r.hiBits, r.prefixLen));
  }
  if (!route) route = { scope: "Reserved", kind: "Reserved" };

  const isEmbedded =
    route.scope === "IPv4-mapped" || route.scope === "NAT64 translation";

  return {
    ip: formatIpv6Canonical(value),
    expanded: formatIpv6Expanded(value),
    kind: route.kind,
    scope: route.scope,
    private: route.kind === "Private",
    loopback: route.scope === "Loopback",
    multicast: route.kind === "Multicast",
    documentation: route.scope === "Documentation",
    transition: route.kind === "Transition",
    globalUnicast: route.scope === "Global unicast",
    embeddedV4: isEmbedded ? ipv4FromLow32(value) : null,
  };
}
