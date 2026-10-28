import React, { useState, useMemo, useEffect, useRef } from "react";
import { Info, MapPin } from "@phosphor-icons/react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { DataList } from "../ui/DataList";
import { ResultBox } from "../ui/ResultBox";
import { parseIpv4, classifyIp, formatNumber } from "../../utils/ip-math";
import { parseIpv6, classifyIpv6 } from "../../utils/ipv6-math";
import {
  lookupIpLocation,
  validateAnyIpForGeo,
  timeZoneValue,
  richIsp,
} from "../../utils/geo-api";

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
  const [geo, setGeo] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

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

  // Public, globally routable addresses get a geolocation panel.
  const geoTarget = useMemo(() => {
    const query = activeQuery.trim();
    if (!query || result.error || !result.rows) return null;
    return validateAnyIpForGeo(query) ? null : query;
  }, [activeQuery, result]);

  useEffect(() => {
    if (!geoTarget) {
      setGeo(null);
      setGeoError(null);
      setGeoLoading(false);
      return;
    }
    let cancelled = false;
    setGeoLoading(true);
    setGeoError(null);
    setGeo(null);
    lookupIpLocation(geoTarget)
      .then((data) => {
        if (!cancelled) setGeo(data);
      })
      .catch((err) => {
        if (!cancelled)
          setGeoError(err instanceof Error ? err.message : "Lookup failed.");
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [geoTarget]);

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
          hint="Classification is offline; public IPs also get a geo panel"
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

        {geoLoading && (
          <p className="toolkit-notice mt-4">Fetching geolocation data…</p>
        )}
        {geoError && (
          <p className="toolkit-error mt-4">Geo lookup failed: {geoError}</p>
        )}
        {geo && (
          <ResultBox
            icon={<MapPin size={16} weight="bold" />}
            title="Geolocation & network"
            badge={geo.primary.ip}
            badgeTone="accent"
          >
            <DataList
              rows={[
                { label: "City", value: geo.primary.city || "n/a" },
                { label: "State/Region", value: geo.primary.region || "n/a" },
                { label: "Country", value: geo.primary.country || "n/a" },
                { label: "Postal code", value: geo.primary.postal || "n/a" },
                {
                  label: "Coordinates",
                  value: `${geo.primary.lat.toFixed(4)}, ${geo.primary.lon.toFixed(4)}`,
                  mono: true,
                },
                { label: "Time zone", value: timeZoneValue(geo.primary) },
                { label: "ISP", value: richIsp(geo.primary) || "n/a" },
                {
                  label: "ASN",
                  value: geo.primary.asn ? `AS${geo.primary.asn}` : "n/a",
                  mono: true,
                },
                { label: "Source database", value: geo.primary.source },
              ]}
            />
          </ResultBox>
        )}
      </div>
    </Card>
  );
}
