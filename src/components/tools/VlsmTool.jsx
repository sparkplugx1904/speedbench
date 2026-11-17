import React, { useState, useMemo } from "react";
import { Plus, Trash, ArrowCounterClockwise, Copy, Check } from "@phosphor-icons/react";
import { calculateVlsm } from "../../utils/vlsm-math.js";
import { ResultBox } from "../ui/ResultBox";

const DEFAULT_SUBNETS = [
  { id: "s1", name: "Engineering / LAN A", hosts: 60 },
  { id: "s2", name: "Sales / LAN B", hosts: 25 },
  { id: "s3", name: "Server Farm", hosts: 12 },
  { id: "s4", name: "Router WAN Link", hosts: 2 },
];

export function VlsmTool() {
  const [parentIp, setParentIp] = useState("192.168.10.0");
  const [parentPrefix, setParentPrefix] = useState("24");
  const [subnets, setSubnets] = useState(DEFAULT_SUBNETS);
  const [copiedId, setCopiedId] = useState(null);

  const result = useMemo(() => {
    return calculateVlsm(parentIp, parentPrefix, subnets);
  }, [parentIp, parentPrefix, subnets]);

  const handleAddSubnet = () => {
    const nextIdx = subnets.length + 1;
    setSubnets([...subnets, { id: `s-${Date.now()}`, name: `Subnet ${nextIdx}`, hosts: 10 }]);
  };

  const handleRemoveSubnet = (id) => {
    if (subnets.length <= 1) return;
    setSubnets(subnets.filter((s) => s.id !== id));
  };

  const handleUpdateSubnet = (id, field, value) => {
    setSubnets(
      subnets.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const copyText = (text, id) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration Card */}
      <ResultBox title="Parent Network Configuration">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="toolkit-label font-mono text-xs uppercase text-(--muted) block mb-1">
              Parent Network Address
            </label>
            <input
              type="text"
              value={parentIp}
              onChange={(e) => setParentIp(e.target.value)}
              className="toolkit-input w-full p-2 border border-(--border) bg-(--surface) text-sm font-mono text-(--ink)"
              placeholder="e.g. 192.168.1.0"
            />
          </div>
          <div>
            <label className="toolkit-label font-mono text-xs uppercase text-(--muted) block mb-1">
              Parent CIDR Prefix
            </label>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 border border-(--border) bg-(--toolkit-wash) font-mono text-sm text-(--muted)">
                /
              </span>
              <input
                type="number"
                min="8"
                max="30"
                value={parentPrefix}
                onChange={(e) => setParentPrefix(e.target.value)}
                className="toolkit-input flex-1 p-2 border border-(--border) bg-(--surface) text-sm font-mono text-(--ink)"
              />
            </div>
          </div>
        </div>
      </ResultBox>

      {/* Subnet Requirements List */}
      <ResultBox title="Subnet Size Requirements (Hosts)">
        <p className="text-xs text-(--muted) mb-3">
          Specify the required usable hosts for each department. VLSM automatically sorts and allocates subnets without address collision.
        </p>

        <div className="flex flex-col gap-2">
          {subnets.map((sub, idx) => (
            <div key={sub.id} className="flex items-center gap-2">
              <span className="font-mono text-xs text-(--muted) w-6 text-right">{idx + 1}.</span>
              <input
                type="text"
                value={sub.name}
                onChange={(e) => handleUpdateSubnet(sub.id, "name", e.target.value)}
                placeholder="Subnet description"
                className="flex-1 p-2 border border-(--border) bg-(--surface) text-xs text-(--ink)"
              />
              <div className="flex items-center gap-1 w-36">
                <input
                  type="number"
                  min="1"
                  max="65534"
                  value={sub.hosts}
                  onChange={(e) => handleUpdateSubnet(sub.id, "hosts", parseInt(e.target.value, 10) || 1)}
                  className="w-20 p-2 border border-(--border) bg-(--surface) text-xs font-mono text-(--ink) text-right"
                />
                <span className="text-xs text-(--muted)">hosts</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSubnet(sub.id)}
                disabled={subnets.length <= 1}
                className="p-2 border border-(--border) hover:bg-(--hover) text-(--muted) hover:text-(--ink) disabled:opacity-30 cursor-pointer"
                aria-label="Delete subnet requirement"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAddSubnet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-(--accent) bg-(--accent) text-(--btn-primary-text) text-xs font-medium cursor-pointer"
          >
            <Plus size={14} weight="bold" /> Add Subnet
          </button>
          <button
            type="button"
            onClick={() => setSubnets(DEFAULT_SUBNETS)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-(--border) hover:bg-(--hover) text-xs font-medium cursor-pointer"
          >
            <ArrowCounterClockwise size={14} /> Reset Defaults
          </button>
        </div>
      </ResultBox>

      {/* Allocation Results */}
      {result.ok ? (
        <>
          {/* Utilization Progress Bar */}
          <div className="border border-(--border) bg-(--surface-raised) p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span>Parent: <strong className="text-(--ink)">{result.parent.cidr}</strong> ({result.stats.totalCapacity} total IPs)</span>
              <span>Allocated: <strong className="text-(--accent)">{result.stats.allocatedAddresses}</strong> ({result.stats.utilizationPct}%)</span>
            </div>
            <div className="w-full h-3 border border-(--border) bg-(--surface) overflow-hidden flex">
              <div
                className="bg-(--accent) h-full transition-all duration-300"
                style={{ width: `${Math.min(100, result.stats.utilizationPct)}%` }}
              />
              <div
                className="bg-(--toolkit-wash) h-full flex-1"
              />
            </div>
            <div className="flex justify-between text-[0.7rem] text-(--muted) font-mono">
              <span>Free Unallocated: {result.stats.freeAddresses} IPs</span>
              <span>Subnets: {result.stats.subnetsCount} allocated</span>
            </div>
          </div>

          {/* Subnet Allocation Table */}
          <div className="toolkit-table-wrap overflow-x-auto">
            <table className="toolkit-table w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left">Subnet</th>
                  <th className="text-center">Req / Usable</th>
                  <th className="text-left">Allocated CIDR</th>
                  <th className="text-left">Netmask</th>
                  <th className="text-left">Usable Range</th>
                  <th className="text-left">Broadcast</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {result.allocations.map((alloc) => (
                  <tr key={alloc.id}>
                    <td className="font-medium text-(--ink)">{alloc.name}</td>
                    <td className="text-center font-mono">
                      <span className="text-(--muted)">{alloc.requestedHosts}</span> /{" "}
                      <strong className="text-(--accent)">{alloc.allocatedHosts}</strong>
                    </td>
                    <td className="font-mono font-semibold text-(--ink)">{alloc.cidr}</td>
                    <td className="font-mono text-(--muted)">{alloc.netmask}</td>
                    <td className="font-mono">{alloc.usableRange}</td>
                    <td className="font-mono text-(--muted)">{alloc.broadcast}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => copyText(`${alloc.cidr} (${alloc.usableRange})`, alloc.id)}
                        className="p-1 hover:bg-(--hover) text-(--muted) hover:text-(--ink) cursor-pointer"
                        title="Copy CIDR and range"
                      >
                        {copiedId === alloc.id ? <Check size={14} className="text-(--accent)" /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unallocated Blocks */}
          {result.unallocatedBlocks.length > 0 && (
            <ResultBox title="Contiguous Free Space for Expansion">
              <div className="flex flex-wrap gap-2">
                {result.unallocatedBlocks.map((blk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-(--border) bg-(--toolkit-wash) font-mono text-xs text-(--ink)"
                  >
                    <span>{blk.cidr}</span>
                    <small className="text-(--muted)">({blk.size} IPs)</small>
                  </span>
                ))}
              </div>
            </ResultBox>
          )}
        </>
      ) : (
        <div className="toolkit-error p-3 border border-red-500 bg-red-500/10 text-red-500 text-sm">
          {result.error}
        </div>
      )}
    </div>
  );
}
