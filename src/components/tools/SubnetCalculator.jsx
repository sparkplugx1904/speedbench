import React, { useState, useMemo } from 'react';
import { Network, GlobeHemisphereWest } from '@phosphor-icons/react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DataList } from '../ui/DataList';
import { ResultBox } from '../ui/ResultBox';
import { parseIpv4, parseMask, calculateSubnet, formatNumber } from '../../utils/ip-math';
import { resolveHostname } from '../../utils/dns-resolver';

export function SubnetCalculator() {
  const [ipInput, setIpInput] = useState('192.168.1.10');
  const [maskInput, setMaskInput] = useState('/24');
  const [activeQuery, setActiveQuery] = useState({ ip: '192.168.1.10', mask: '/24' });
  const [resolving, setResolving] = useState(false);
  const [dnsNote, setDnsNote] = useState(null);

  const result = useMemo(() => {
    const ipRes = parseIpv4(activeQuery.ip);
    if (!ipRes.ok) return { error: ipRes.error, info: null };
    const maskRes = parseMask(activeQuery.mask);
    if (!maskRes.ok) return { error: maskRes.error, info: null };
    return { error: null, info: calculateSubnet(ipRes.value, maskRes.value.prefix) };
  }, [activeQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDnsNote(null);
    let targetIp = ipInput.trim();

    // Check if user entered a domain instead of raw IP
    if (targetIp && !/^(\d{1,3}\.){3}\d{1,3}$/.test(targetIp)) {
      setResolving(true);
      const dohRes = await resolveHostname(targetIp);
      setResolving(false);
      if (!dohRes.ok) {
        setDnsNote({ type: 'error', text: dohRes.error });
        return;
      }
      targetIp = dohRes.ip;
      setIpInput(dohRes.ip);
      setDnsNote({ type: 'info', text: `Resolved “${ipInput}” → ${dohRes.ip} (${dohRes.provider})` });
    }

    setActiveQuery({ ip: targetIp, mask: maskInput });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input
          id="subnet-ip"
          name="ip"
          label="IP address or Domain"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="192.168.1.10 or domain…"
          hint="Supports IP or hostname (e.g. cloudflare.com)"
        />
        <Input
          id="subnet-mask"
          name="mask"
          label="Mask or prefix"
          value={maskInput}
          onChange={(e) => setMaskInput(e.target.value)}
          placeholder="/24 or 255.255.255.0…"
          hint="CIDR or dotted decimal"
        />
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={resolving}>
            {resolving ? 'Resolving DNS…' : 'Calculate'}
          </Button>
          {dnsNote && (
            <span className={`text-xs font-mono ${dnsNote.type === 'error' ? 'text-red-500' : 'text-(--accent)'}`}>
              {dnsNote.text}
            </span>
          )}
        </div>
      </form>

      <div className="mt-6" aria-live="polite">
        {result.error && <p className="toolkit-error">{result.error}</p>}
        {result.info && (
          <ResultBox
            icon={<Network size={16} weight="bold" />}
            title="Subnet breakdown"
            badge={`${result.info.network}/${result.info.prefix}`}
            badgeTone="accent"
            note="Pure bitwise math, computed locally in your browser."
          >
            <DataList
              rows={[
                {
                  label: 'CIDR',
                  value: `${result.info.network}/${result.info.prefix}`,
                  emphasize: true,
                  mono: true,
                },
                { label: 'Network', value: result.info.network, mono: true },
                { label: 'Broadcast', value: result.info.broadcast, mono: true },
                { label: 'Subnet mask', value: result.info.mask, mono: true },
                { label: 'Wildcard', value: result.info.wildcard, mono: true },
                {
                  label: 'Host range',
                  value:
                    result.info.firstHost && result.info.lastHost
                      ? `${result.info.firstHost} - ${result.info.lastHost}`
                      : 'n/a',
                  mono: true,
                },
                {
                  label: 'Total addresses',
                  value: formatNumber(result.info.totalAddresses),
                },
                { label: 'Usable hosts', value: formatNumber(result.info.usableHosts) },
                {
                  label: 'Mask (binary)',
                  value: result.info.binaryMask,
                  mono: true,
                },
                {
                  label: 'Network (binary)',
                  value: result.info.binaryNetwork,
                  mono: true,
                },
              ]}
            />
          </ResultBox>
        )}
      </div>
    </Card>
  );
}
