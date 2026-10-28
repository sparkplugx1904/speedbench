import React, { useState, useEffect, useCallback } from "react";
import { MapPin } from "@phosphor-icons/react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { DataList } from "../ui/DataList";
import { ResultBox } from "../ui/ResultBox";
import {
  lookupIpLocation,
  formatUtcOffset,
  utcOffsetFromZone,
} from "../../utils/geo-api";
import { LeafletMap } from "./LeafletMap";

function timeZoneValue(primary) {
  const utc =
    formatUtcOffset(primary.utcOffset) || utcOffsetFromZone(primary.timezone);
  if (utc && primary.timezone) return `${utc} (${primary.timezone})`;
  return utc || primary.timezone || "n/a";
}

export function LocateTool({ presetIp, myIp }) {
  const initialIp = presetIp || myIp || "";
  const [ipInput, setIpInput] = useState(initialIp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const doLookup = useCallback(async (ipToSearch) => {
    const target = (ipToSearch || "").trim();
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const data = await lookupIpLocation(target);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (presetIp) {
      setIpInput(presetIp);
      doLookup(presetIp);
    } else if (myIp && !result && !error) {
      setIpInput(myIp);
      doLookup(myIp);
    }
  }, [presetIp, myIp, doLookup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    doLookup(ipInput);
  };

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <Input
          id="locate-ip"
          name="ip"
          label="IPv4 address to locate"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="Enter IP (e.g. 1.1.1.1)…"
          hint="Uses public free geolocation providers"
        />
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Locating…" : "Locate"}
        </Button>
      </form>

      <div className="mt-6" aria-live="polite">
        {error && <p className="toolkit-error">{error}</p>}

        {result && (
          <ResultBox
            icon={<MapPin size={16} weight="bold" />}
            title="Geolocation"
            badge={result.primary.ip}
            badgeTone="accent"
          >
            <div className="flex flex-col gap-4">
              {result.warnings.length > 0 && (
                <div className="toolkit-notice">
                  {result.warnings.map((w, idx) => (
                    <p key={idx}>⚠️ {w}</p>
                  ))}
                </div>
              )}

              <LeafletMap primary={result.primary} sources={result.sources} />

              <DataList
                rows={[
                  {
                    label: "IP",
                    value: result.primary.ip,
                    mono: true,
                    emphasize: true,
                  },
                  { label: "City", value: result.primary.city || "n/a" },
                  {
                    label: "State/Region",
                    value: result.primary.region || "n/a",
                  },
                  { label: "Country", value: result.primary.country || "n/a" },
                  {
                    label: "Postal code",
                    value: result.primary.postal || "n/a",
                  },
                  {
                    label: "Coordinates",
                    value: `${result.primary.lat.toFixed(4)}, ${result.primary.lon.toFixed(4)}`,
                    mono: true,
                  },
                  { label: "Time zone", value: timeZoneValue(result.primary) },
                  {
                    label: "ISP",
                    value: result.primary.isp || result.primary.org || "n/a",
                  },
                  {
                    label: "ASN",
                    value: result.primary.asn
                      ? `AS${result.primary.asn}`
                      : "n/a",
                    mono: true,
                  },
                  { label: "Source database", value: result.primary.source },
                ]}
              />

              <div className="flex gap-2">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${result.primary.lat}&mlon=${result.primary.lon}#map=12/${result.primary.lat}/${result.primary.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toolkit-chip"
                >
                  View on OpenStreetMap ↗
                </a>
              </div>
            </div>

            {result.sources.length > 1 && (
              <div>
                <p className="toolkit-result-note mb-2">
                  All provider responses:
                </p>
                <div className="toolkit-table-wrap">
                  <table className="toolkit-table w-full text-left text-xs">
                    <thead>
                      <tr>
                        <th className="px-3 py-2">Source</th>
                        <th className="px-3 py-2">City</th>
                        <th className="px-3 py-2">Region</th>
                        <th className="px-3 py-2">Country</th>
                        <th className="px-3 py-2">Coordinates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border)">
                      {result.sources.map((s) => (
                        <tr
                          key={s.source}
                          className={
                            s.source === result.primary.source
                              ? "bg-(--surface-raised)"
                              : ""
                          }
                        >
                          <td className="px-3 py-2 font-medium">{s.source}</td>
                          <td className="px-3 py-2">{s.city || "—"}</td>
                          <td className="px-3 py-2">{s.region || "—"}</td>
                          <td className="px-3 py-2">{s.country || "—"}</td>
                          <td className="is-mono px-3 py-2">
                            {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ResultBox>
        )}
      </div>
    </Card>
  );
}
