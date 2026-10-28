/**
 * IPv4 & Subnetting calculation utilities
 */

export function parseIpv4(input) {
  const str = input.trim();
  if (!str) return { ok: false, error: 'Enter an IPv4 address.' };
  const octets = str.split('.');
  if (octets.length !== 4) {
    return { ok: false, error: 'IPv4 needs 4 octets (e.g. 192.168.1.10).' };
  }
  let intVal = 0;
  for (const oct of octets) {
    if (!/^\d+$/.test(oct)) return { ok: false, error: `Invalid octet “${oct}”.` };
    if (oct.length > 1 && oct.startsWith('0')) {
      return { ok: false, error: `Leading zeros are not allowed (“${oct}”).` };
    }
    const num = Number(oct);
    if (num < 0 || num > 255) {
      return { ok: false, error: `Octet ${num} is out of range (0-255).` };
    }
    intVal = ((intVal << 8) >>> 0) + num;
  }
  return { ok: true, value: intVal >>> 0 };
}

export function intToIpv4(intVal) {
  const t = intVal >>> 0;
  return [(t >>> 24) & 255, (t >>> 16) & 255, (t >>> 8) & 255, t & 255].join('.');
}

export function intToBinaryIpv4(intVal) {
  return intToIpv4(intVal)
    .split('.')
    .map((oct) => Number(oct).toString(2).padStart(8, '0'))
    .join('.');
}

export function parsePrefix(input) {
  const str = input.trim().replace(/^\//, '');
  if (!str) return { ok: false, error: 'Enter a prefix length (0-32).' };
  if (!/^\d+$/.test(str)) {
    return { ok: false, error: 'Prefix must be a number (e.g. 24).' };
  }
  const prefix = Number(str);
  return prefix < 0 || prefix > 32
    ? { ok: false, error: 'Prefix must be between 0 and 32.' }
    : { ok: true, value: prefix };
}

export function prefixToMaskInt(prefix) {
  return prefix === 0 ? 0 : (4294967295 << (32 - prefix)) >>> 0;
}

export function maskIntToPrefix(maskInt) {
  const t = maskInt >>> 0;
  let seenZero = false;
  let prefix = 0;
  for (let bit = 31; bit >= 0; bit--) {
    if (((t >>> bit) & 1) === 1) {
      if (seenZero) {
        return { ok: false, error: 'Mask is not contiguous (must be /n style).' };
      }
      prefix++;
    } else {
      seenZero = true;
    }
  }
  return { ok: true, value: prefix };
}

export function parseMask(input) {
  const str = input.trim();
  if (!str) {
    return { ok: false, error: 'Enter a mask (255.255.255.0) or prefix (/24).' };
  }
  if (str.includes('/')) {
    const res = parsePrefix(str);
    return res.ok ? { ok: true, value: { prefix: res.value, mask: prefixToMaskInt(res.value) } } : res;
  }
  if (str.includes('.')) {
    const ipRes = parseIpv4(str);
    if (!ipRes.ok) return ipRes;
    const prefRes = maskIntToPrefix(ipRes.value);
    return prefRes.ok ? { ok: true, value: { prefix: prefRes.value, mask: ipRes.value } } : prefRes;
  }
  const prefRes = parsePrefix(str);
  return prefRes.ok ? { ok: true, value: { prefix: prefRes.value, mask: prefixToMaskInt(prefRes.value) } } : prefRes;
}

export function parseCidr(input) {
  const str = input.trim();
  const slashIdx = str.indexOf('/');
  if (slashIdx === -1) {
    return { ok: false, error: 'Use CIDR form (e.g. 192.168.1.0/24).' };
  }
  const ipRes = parseIpv4(str.slice(0, slashIdx));
  if (!ipRes.ok) return ipRes;
  const prefRes = parsePrefix(str.slice(slashIdx + 1));
  return prefRes.ok ? { ok: true, value: { ip: ipRes.value, prefix: prefRes.value } } : prefRes;
}

export function calculateSubnet(ipInt, prefix) {
  const mask = prefixToMaskInt(prefix);
  const wildcard = ~mask >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  let firstHost = null;
  let lastHost = null;
  let usableHosts = 0;

  if (prefix === 32) {
    usableHosts = 1;
    firstHost = intToIpv4(network);
    lastHost = intToIpv4(network);
  } else if (prefix === 31) {
    usableHosts = 2;
    firstHost = intToIpv4(network);
    lastHost = intToIpv4(broadcast);
  } else {
    usableHosts = Math.max(totalAddresses - 2, 0);
    firstHost = intToIpv4((network + 1) >>> 0);
    lastHost = intToIpv4((broadcast - 1) >>> 0);
  }

  return {
    inputIp: intToIpv4(ipInt),
    prefix,
    mask: intToIpv4(mask),
    wildcard: intToIpv4(wildcard),
    network: intToIpv4(network),
    broadcast: intToIpv4(broadcast),
    firstHost,
    lastHost,
    totalAddresses,
    usableHosts,
    networkInt: network,
    broadcastInt: broadcast,
    maskInt: mask,
    binaryMask: intToBinaryIpv4(mask),
    binaryNetwork: intToBinaryIpv4(network),
  };
}

export function isInSameSubnet(ip1Int, ip2Int, prefix) {
  const mask = prefixToMaskInt(prefix);
  return (ip1Int & mask) >>> 0 === (ip2Int & mask) >>> 0;
}

export function isIpInRange(ipInt, startIpStr, endIpStr) {
  const start = parseIpv4(startIpStr);
  const end = parseIpv4(endIpStr);
  if (!start.ok || !end.ok) return false;
  return ipInt >= start.value && ipInt <= end.value;
}

export function classifyIp(ipInt) {
  const firstOctet = (ipInt >>> 24) & 255;
  let classLetter;
  let classRange;

  if (firstOctet <= 127) {
    classLetter = 'A';
    classRange = '1.0.0.0 - 126.255.255.255 (0/8 and 127/8 special)';
  } else if (firstOctet <= 191) {
    classLetter = 'B';
    classRange = '128.0.0.0 - 191.255.255.255';
  } else if (firstOctet <= 223) {
    classLetter = 'C';
    classRange = '192.0.0.0 - 223.255.255.255';
  } else if (firstOctet <= 239) {
    classLetter = 'D';
    classRange = '224.0.0.0 - 239.255.255.255 (multicast)';
  } else {
    classLetter = 'E';
    classRange = '240.0.0.0 - 255.255.255.255 (reserved)';
  }

  const loopback = isIpInRange(ipInt, '127.0.0.0', '127.255.255.255');
  const linkLocal = isIpInRange(ipInt, '169.254.0.0', '169.254.255.255');
  const multicast = firstOctet >= 224 && firstOctet <= 239;
  const broadcast = ipInt === 4294967295;
  const documentation =
    isIpInRange(ipInt, '192.0.2.0', '192.0.2.255') ||
    isIpInRange(ipInt, '198.51.100.0', '198.51.100.255') ||
    isIpInRange(ipInt, '203.0.113.0', '203.0.113.255');
  const cgnat = isIpInRange(ipInt, '100.64.0.0', '100.127.255.255');
  const isPrivate =
    isIpInRange(ipInt, '10.0.0.0', '10.255.255.255') ||
    isIpInRange(ipInt, '172.16.0.0', '172.31.255.255') ||
    isIpInRange(ipInt, '192.168.0.0', '192.168.255.255');

  let kind = 'Public unicast';
  if (ipInt === 0) kind = 'This network (0.0.0.0)';
  else if (broadcast) kind = 'Limited broadcast';
  else if (loopback) kind = 'Loopback';
  else if (linkLocal) kind = 'Link-local (APIPA)';
  else if (cgnat) kind = 'Shared address space (CGNAT)';
  else if (documentation) kind = 'Documentation (TEST-NET)';
  else if (isPrivate) kind = 'Private (RFC 1918)';
  else if (multicast) kind = 'Multicast';
  else if (classLetter === 'E') kind = 'Reserved (Class E)';
  else if (firstOctet === 0) kind = 'This network';

  return {
    ip: intToIpv4(ipInt),
    binary: intToBinaryIpv4(ipInt),
    integer: ipInt >>> 0,
    hex: '0x' + (ipInt >>> 0).toString(16).padStart(8, '0'),
    classLetter,
    classRange,
    kind,
    private: isPrivate,
    loopback,
    linkLocal,
    multicast,
    broadcast,
    documentation,
    cgnat,
  };
}

export function prefixHostCounts(prefix) {
  const total = 2 ** (32 - prefix);
  return prefix === 32
    ? { total, usable: 1 }
    : prefix === 31
      ? { total, usable: 2 }
      : { total, usable: Math.max(total - 2, 0) };
}

export function hostsToPrefix(hostCount) {
  if (!Number.isFinite(hostCount) || hostCount < 1) {
    return { ok: false, error: 'Enter a host count of 1 or more.' };
  }
  if (hostCount === 1) return { ok: true, value: 32 };
  if (hostCount === 2) return { ok: true, value: 31 };
  for (let p = 30; p >= 0; p--) {
    if (prefixHostCounts(p).usable >= hostCount) return { ok: true, value: p };
  }
  return { ok: false, error: 'That many hosts cannot fit in IPv4.' };
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}
