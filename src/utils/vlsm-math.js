import {
  parseIpv4,
  parsePrefix,
  intToIpv4,
  prefixToMaskInt,
} from "./ip-math.js";

/**
 * Calculate Variable Length Subnet Masking (VLSM) allocation.
 *
 * @param {string} parentIpStr - Base IPv4 address (e.g. "192.168.1.0")
 * @param {number} parentPrefix - Prefix length (e.g. 24)
 * @param {Array<{id: string, name: string, hosts: number}>} requests - Subnet requests
 * @returns {Object} Result object with allocations, summary, and status
 */
export function calculateVlsm(parentIpStr, parentPrefix, requests) {
  const parsedIp = parseIpv4(parentIpStr);
  if (!parsedIp.ok) return { ok: false, error: parsedIp.error };

  const parsedPref = parsePrefix(String(parentPrefix));
  if (!parsedPref.ok) return { ok: false, error: parsedPref.error };

  const prefix = parsedPref.value;
  const parentMaskInt = prefixToMaskInt(prefix);
  const parentNetworkInt = (parsedIp.value & parentMaskInt) >>> 0;
  const parentCapacity = prefix === 0 ? 4294967296 : 2 ** (32 - prefix);
  const parentBroadcastInt = (parentNetworkInt + parentCapacity - 1) >>> 0;

  // Filter and sanitize requests
  const validRequests = requests
    .map((r, idx) => ({
      id: r.id || `sub-${idx}`,
      name: (r.name || `Subnet ${idx + 1}`).trim(),
      hosts: Math.max(1, parseInt(r.hosts, 10) || 1),
      originalIndex: idx,
    }))
    .filter((r) => r.hosts > 0);

  if (validRequests.length === 0) {
    return {
      ok: false,
      error: "Please specify at least one subnet with required host count.",
    };
  }

  // Sort descending by host count (VLSM standard requirement)
  const sortedRequests = [...validRequests].sort((a, b) => b.hosts - a.hosts);

  let currentIp = parentNetworkInt;
  let totalAllocatedSize = 0;
  const allocations = [];
  const overflowSubnets = [];

  for (const req of sortedRequests) {
    // Standard host addressing: needs +2 (network + broadcast)
    const needed = req.hosts <= 2 ? 4 : req.hosts + 2;
    // Find smallest power of 2 >= needed
    const power = Math.ceil(Math.log2(needed));
    const subPrefix = Math.max(0, 32 - power);
    const subSize = 2 ** power;

    // Check if allocation fits within parent network
    if (
      currentIp + subSize - 1 > parentBroadcastInt ||
      totalAllocatedSize + subSize > parentCapacity
    ) {
      overflowSubnets.push({
        ...req,
        neededSize: subSize,
        neededPrefix: subPrefix,
        reason: "Insufficient address space in parent network",
      });
      continue;
    }

    const netInt = currentIp;
    const bcastInt = (netInt + subSize - 1) >>> 0;
    const maskInt = prefixToMaskInt(subPrefix);
    const usableHosts = subPrefix === 31 ? 2 : subPrefix === 32 ? 1 : Math.max(0, subSize - 2);
    const firstUsable = subPrefix >= 31 ? netInt : (netInt + 1) >>> 0;
    const lastUsable = subPrefix >= 31 ? bcastInt : (bcastInt - 1) >>> 0;

    allocations.push({
      id: req.id,
      name: req.name,
      requestedHosts: req.hosts,
      allocatedHosts: usableHosts,
      wastedHosts: usableHosts - req.hosts,
      network: intToIpv4(netInt),
      networkInt: netInt,
      prefix: subPrefix,
      cidr: `${intToIpv4(netInt)}/${subPrefix}`,
      netmask: intToIpv4(maskInt),
      firstUsable: intToIpv4(firstUsable),
      lastUsable: intToIpv4(lastUsable),
      usableRange: `${intToIpv4(firstUsable)} – ${intToIpv4(lastUsable)}`,
      broadcast: intToIpv4(bcastInt),
      totalAddresses: subSize,
      originalIndex: req.originalIndex,
    });

    currentIp = (bcastInt + 1) >>> 0;
    totalAllocatedSize += subSize;
  }

  // Calculate unallocated space
  const unallocatedBlocks = [];
  let freePointer = currentIp;
  while (freePointer <= parentBroadcastInt && totalAllocatedSize < parentCapacity) {
    const remainingAddresses = parentBroadcastInt - freePointer + 1;
    if (remainingAddresses <= 0) break;

    // Largest power of 2 that fits remaining and aligns with freePointer
    let maxPower = Math.floor(Math.log2(remainingAddresses));
    while (maxPower >= 0 && freePointer % 2 ** maxPower !== 0) {
      maxPower--;
    }

    const blockSize = 2 ** maxPower;
    const blockPrefix = 32 - maxPower;
    unallocatedBlocks.push({
      cidr: `${intToIpv4(freePointer)}/${blockPrefix}`,
      network: intToIpv4(freePointer),
      prefix: blockPrefix,
      size: blockSize,
    });

    freePointer = (freePointer + blockSize) >>> 0;
  }

  const freeAddresses = Math.max(0, parentCapacity - totalAllocatedSize);
  const utilizationPct = Number(
    ((totalAllocatedSize / parentCapacity) * 100).toFixed(1)
  );

  return {
    ok: true,
    parent: {
      network: intToIpv4(parentNetworkInt),
      prefix,
      cidr: `${intToIpv4(parentNetworkInt)}/${prefix}`,
      broadcast: intToIpv4(parentBroadcastInt),
      capacity: parentCapacity,
    },
    allocations,
    overflowSubnets,
    unallocatedBlocks,
    stats: {
      totalCapacity: parentCapacity,
      allocatedAddresses: totalAllocatedSize,
      freeAddresses,
      utilizationPct,
      subnetsCount: allocations.length,
      overflowCount: overflowSubnets.length,
    },
  };
}
