import { parseIpv4, classifyIp } from './ip-math';

export function haversineDistance(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

export function checkCgnatHint(info) {
  const text = [info.org, info.isp, info.hostname]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /\bcgnat\b|\bcgn\b|carrier.?grade/.test(text);
}

export function validatePublicIpForGeo(ipStr) {
  const parsed = parseIpv4(ipStr);
  if (!parsed.ok) return parsed.error;
  const c = classifyIp(parsed.value);
  if (c.private) return 'Private RFC 1918 addresses are not on the public internet map.';
  if (c.loopback) return 'Loopback addresses are local to this machine.';
  if (c.linkLocal) return 'Link-local addresses are not globally routable.';
  if (c.multicast) return 'Multicast addresses have no single geographic location.';
  if (c.cgnat) return 'CGNAT shared space (100.64.0.0/10) is not a unique public location.';
  if (c.broadcast || c.ip === '0.0.0.0') return 'This address cannot be geolocated.';
  return null;
}

export async function fetchGeoFromGeoJs(ip) {
  const res = await fetch(`https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`);
  if (!res.ok) throw new Error(`geojs.io returned ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const lat = Number(data.latitude);
  const lon = Number(data.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('geojs.io: no coordinates');
  }

  const org = data.organization_name || data.organization || null;
  const asn = data.asn == null ? null : String(data.asn);

  return {
    ip: data.ip ?? ip,
    lat,
    lon,
    city: data.city || null,
    region: data.region || null,
    country: data.country || null,
    countryCode: data.country_code || null,
    org,
    isp: org,
    asn,
    hostname: null,
    timezone: data.timezone || null,
    accuracyKm: data.accuracy ? Number(data.accuracy) : null,
    source: 'geojs.io',
    cgnatHint: checkCgnatHint({ org }),
  };
}

export async function fetchGeoFromIpWhoIs(ip) {
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
  if (!res.ok) throw new Error(`ipwho.is returned ${res.status}`);
  const data = await res.json();
  if (data.success === false) throw new Error(data.message || 'ipwho.is failed');

  const lat = Number(data.latitude);
  const lon = Number(data.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('ipwho.is: no coordinates');
  }

  const org = data.connection?.org || null;
  const isp = data.connection?.isp || null;

  return {
    ip: data.ip ?? ip,
    lat,
    lon,
    city: data.city || null,
    region: data.region || null,
    country: data.country || null,
    countryCode: data.country_code || null,
    org,
    isp,
    asn: data.connection?.asn == null ? null : String(data.connection.asn),
    hostname: null,
    timezone: data.timezone?.id || null,
    accuracyKm: null,
    source: 'ipwho.is',
    cgnatHint: checkCgnatHint({ org, isp }),
  };
}

export async function fetchGeoFromIpApi(ip) {
  const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  if (!res.ok) throw new Error(`ipapi.co returned ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.reason || 'ipapi.co failed');

  const lat = Number(data.latitude);
  const lon = Number(data.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('ipapi.co: no coordinates');
  }

  const org = data.org || null;

  return {
    ip: data.ip ?? ip,
    lat,
    lon,
    city: data.city || null,
    region: data.region || null,
    country: data.country_name || null,
    countryCode: data.country_code || null,
    org,
    isp: org,
    asn: data.asn || null,
    hostname: null,
    timezone: data.timezone || null,
    accuracyKm: null,
    source: 'ipapi.co',
    cgnatHint: checkCgnatHint({ org }),
  };
}

export function pickBestGeoSource(sources) {
  if (sources.length === 1) return sources[0];
  const order = ['ipwho.is', 'ipapi.co', 'geojs.io'];
  const clusters = new Map();

  for (const s of sources) {
    const key = (s.city || s.region || s.country || s.source).toLowerCase();
    const group = clusters.get(key) ?? [];
    group.push(s);
    clusters.set(key, group);
  }

  let largestCluster = sources;
  for (const group of clusters.values()) {
    if (group.length > largestCluster.length) {
      largestCluster = group;
    }
  }

  if (largestCluster.length === 1 && sources.length >= 2) {
    let bestScore = -1;
    let bestSource = sources[0];
    for (const s of sources) {
      const nearCount = sources.filter((other) => other !== s && haversineDistance(s, other) < 80).length;
      const rank = order.length - order.indexOf(s.source);
      const score = nearCount * 10 + (rank > order.length ? 0 : rank);
      if (score > bestScore) {
        bestScore = score;
        bestSource = s;
      }
    }
    return bestSource;
  }

  for (const provider of order) {
    const found = largestCluster.find((s) => s.source === provider);
    if (found) return found;
  }

  return largestCluster[0];
}

export function hasLocationDisagreement(sources) {
  if (sources.length < 2) return false;
  const distinctCities = new Set(sources.map((s) => (s.city || '').toLowerCase()).filter(Boolean));
  if (distinctCities.size > 1) return true;

  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      if (haversineDistance(sources[i], sources[j]) > 50) return true;
    }
  }
  return false;
}

export async function lookupIpLocation(rawIp) {
  const ip = rawIp.trim();
  const validationError = validatePublicIpForGeo(ip);
  if (validationError) throw new Error(validationError);

  const results = await Promise.allSettled([
    fetchGeoFromIpWhoIs(ip),
    fetchGeoFromIpApi(ip),
    fetchGeoFromGeoJs(ip),
  ]);

  const sources = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  if (sources.length === 0) {
    const msg = results
      .map((r) => (r.status === 'rejected' ? String(r.reason) : null))
      .filter(Boolean)
      .join('; ');
    throw new Error(msg || 'All geolocation providers failed.');
  }

  const primary = pickBestGeoSource(sources);
  const disagree = hasLocationDisagreement(sources);
  const cgnatHint = sources.some((s) => s.cgnatHint) || /cgnat/i.test(primary.org || '');
  const warnings = [];

  if (cgnatHint) {
    warnings.push('This looks like ISP CGNAT. City-level results are often wrong or point at a regional POP, not your street.');
  }
  if (disagree) {
    warnings.push('Free geo databases disagree on this IP. The map shows every source; the highlighted pin is the best guess.');
  }

  return { ip, primary, sources, disagree, cgnatHint, warnings };
}

export async function detectMyPublicIp() {
  try {
    const res = await fetch('https://ipwho.is/');
    if (!res.ok) throw new Error(`ipwho.is returned ${res.status}`);
    const data = await res.json();
    if (data.success === false || !data.ip) {
      throw new Error(data.message || 'Could not detect IP');
    }
    return {
      ip: data.ip,
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      org: data.connection?.org || data.connection?.isp || null,
    };
  } catch {
    const res = await fetch('https://get.geojs.io/v1/ip.json');
    if (!res.ok) throw new Error('Could not detect your public IP.');
    const data = await res.json();
    if (!data.ip) throw new Error('Could not detect your public IP.');
    try {
      const geo = await fetchGeoFromGeoJs(data.ip);
      return {
        ip: data.ip,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        org: geo.org,
      };
    } catch {
      return { ip: data.ip, city: null, region: null, country: null, org: null };
    }
  }
}
