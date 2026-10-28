import React, { useState, useMemo, useEffect, useRef } from "react";
import { Info } from "@phosphor-icons/react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { DataList } from "../ui/DataList";
import { ResultBox } from "../ui/ResultBox";
import { parseIpv4, classifyIp, formatNumber } from "../../utils/ip-math";
import { parseIpv6, classifyIpv6 } from "../../utils/ipv6-math";

const DEFAULT_EXAMPLE = "8.8.8.8";

function buildIpv6Rows(parsed, info) {
  const rows = [
    { label: "Address", value: info.ip, mono: true, emphasize: true },
    { label: "Stack", value: "IPv6" },
    { label: "Kind", value: info.kind },
    { label: "Type", value: info.scope },
    { label: "Full form", value: info.expanded, mono: true },
    {
      label: "Integer",
      value: parsed.value.toLocaleString("en-US"),
      mono: true,
    },
  ];
  if (info.embeddedV4) {
    rows.push({ label: "Embedded IPv4", value: info.embeddedV4, mono: true });
  }
  rows.push(
    { label: "Private", value: info.private ? "Yes" : "No" },
    { label: "Loopback", value: info.loopback ? "Yes" : "No" },
    { label: "Multicast", value: info.multicast ? "Yes" : "No" },
    { label: "Documentation", value: info.documentation ? "Yes" : "No" },
  );
  return rows;
}

function buildIpv4Rows(info) {
  return [
    { label: "Address", value: info.ip, mono: true, emphasize: true },
    { label: "Stack", value: "IPv4" },
    { label: "Kind", value: info.kind },
    { label: "Class", value: info.classLetter },
    { label: "Class span", value: info.classRange },
    { label: "Binary", value: info.binary, mono: true },
    { label: "Integer", value: formatNumber(info.integer), mono: true },
    { label: "Hex", value: info.hex, mono: true },
    { label: "Private", value: info.private ? "Yes" : "No" },
    { label: "Loopback", value: info.loopback ? "Yes" : "No" },
    { label: "Link-local", value: info.linkLocal ? "Yes" : "No" },
    { label: "Multicast", value: info.multicast ? "Yes" : "No" },
    { label: "CGNAT", value: info.cgnat ? "Yes" : "No" },
    { label: "Documentation", value: info.documentation ? "Yes" : "No" },
  ];
}

export function IpInfoTool({ myIp }) {
  const [ipInput, setIpInput] = useState(DEFAULT_EXAMPLE);
  const [activeQuery, setActiveQuery] = useState(DEFAULT_EXAMPLE);
  const userEditedRef = useRef(false);

  // Prefill with the detected public IP until the user types their own.
  useEffect(() => {
    if (myIp && !userEditedRef.current) {
      setIpInput(myIp);
      setActiveQuery(myIp);
    }
  }, [myIp]);

  const result = useMemo(() => {
    const query = activeQuery.trim();
    if (query.includes(":")) {
      const parsed = parseIpv6(query);
      if (!parsed.ok) return { error: parsed.error, rows: null };
      return {
        error: null,
        rows: buildIpv6Rows(parsed, classifyIpv6(parsed.value)),
      };
    }
    const parsed = parseIpv4(query);
    if (!parsed.ok) return { error: parsed.error, rows: null };
    return { error: null, rows: buildIpv4Rows(classifyIp(parsed.value)) };
  }, [activeQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveQuery(ipInput);
  };

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <Input
          id="info-ip"
          name="ip"
          label="IPv4 or IPv6 address"
          value={ipInput}
          onChange={(e) => {
            userEditedRef.current = true;
            setIpInput(e.target.value);
          }}
          placeholder="8.8.8.8 or 2001:db8::1…"
          hint="Dual-stack classification, computed offline"
        />
        <Button type="submit" variant="primary">
          Inspect
        </Button>
      </form>

      <div className="mt-6" aria-live="polite">
        {result.error && <p className="toolkit-error">{result.error}</p>}
        {result.rows && (
          <ResultBox
            icon={<Info size={16} weight="bold" />}
            title="Address classification"
            badge={result.rows[0].value}
            badgeTone="accent"
          >
            <DataList rows={result.rows} />
          </ResultBox>
        )}
      </div>
    </Card>
  );
}
