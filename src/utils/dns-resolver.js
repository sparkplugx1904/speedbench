/**
 * DNS over HTTPS (DoH) Client for in-browser hostname resolution.
 * Primary: Cloudflare 1.1.1.1 DoH
 * Fallback: Google Public DNS DoH
 */

export async function resolveHostname(hostname, type = "A") {
  const cleanHost = hostname.trim().toLowerCase();
  if (!cleanHost) {
    return { ok: false, error: "Enter a valid hostname (e.g. cloudflare.com)." };
  }

  // Quick check if already an IP
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost)) {
    return { ok: true, ip: cleanHost, allIps: [cleanHost] };
  }

  // Helper to query DoH JSON endpoint
  async function queryDoh(endpoint) {
    const res = await fetch(endpoint, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`DNS server returned HTTP ${res.status}`);
    const data = await res.json();
    if (data.Status !== 0) {
      const errMap = {
        1: "Format error",
        2: "Server failure",
        3: "Non-existent domain (NXDOMAIN)",
        4: "Not implemented",
        5: "Query refused",
      };
      throw new Error(errMap[data.Status] || `DNS error code ${data.Status}`);
    }
    const answers = (data.Answer || []).filter(
      (a) => a.type === (type === "AAAA" ? 28 : 1)
    );
    if (answers.length === 0) {
      throw new Error(`No ${type} record found for “${cleanHost}”.`);
    }
    const ips = answers.map((a) => a.data);
    return { ip: ips[0], allIps: ips };
  }

  // 1. Try Cloudflare DoH
  try {
    const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
      cleanHost
    )}&type=${type}`;
    const result = await queryDoh(cfUrl);
    return { ok: true, ip: result.ip, allIps: result.allIps, provider: "Cloudflare 1.1.1.1" };
  } catch (cfErr) {
    // 2. Fallback to Google DoH
    try {
      const gUrl = `https://dns.google/resolve?name=${encodeURIComponent(
        cleanHost
      )}&type=${type}`;
      const result = await queryDoh(gUrl);
      return { ok: true, ip: result.ip, allIps: result.allIps, provider: "Google DNS" };
    } catch {
      return {
        ok: false,
        error: `Could not resolve “${cleanHost}”: ${cfErr.message || "DNS timeout"}`,
      };
    }
  }
}
