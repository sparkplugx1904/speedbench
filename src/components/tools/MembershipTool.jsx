import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Crosshair } from '@phosphor-icons/react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DataList } from '../ui/DataList';
import { ResultBox } from '../ui/ResultBox';
import {
  parseIpv4,
  parseCidr,
  parseMask,
  calculateSubnet,
  isInSameSubnet,
} from '../../utils/ip-math';

export function MembershipTool() {
  const [hostIpInput, setHostIpInput] = useState('192.168.1.50');
  const [netInput, setNetInput] = useState('192.168.1.0/24');
  const [activeQuery, setActiveQuery] = useState({ ip: '192.168.1.50', network: '192.168.1.0/24' });

  const result = useMemo(() => {
    const ipRes = parseIpv4(activeQuery.ip);
    if (!ipRes.ok) return { error: ipRes.error };

    let netIp;
    let netPrefix;

    if (activeQuery.network.includes('/')) {
      const cidrRes = parseCidr(activeQuery.network);
      if (!cidrRes.ok) return { error: cidrRes.error };
      netIp = cidrRes.value.ip;
      netPrefix = cidrRes.value.prefix;
    } else {
      const parts = activeQuery.network.trim().split(/\s+/);
      if (parts.length !== 2) {
        return {
          error: 'Use CIDR (10.0.0.0/8) or “network mask” (10.0.0.0 255.0.0.0).',
        };
      }
      const pIp = parseIpv4(parts[0]);
      if (!pIp.ok) return { error: pIp.error };
      const pMask = parseMask(parts[1]);
      if (!pMask.ok) return { error: pMask.error };
      netIp = pIp.value;
      netPrefix = pMask.value.prefix;
    }

    const subnet = calculateSubnet(netIp, netPrefix);
    const belongs = isInSameSubnet(ipRes.value, netIp, netPrefix);

    return { error: null, belongs, subnet, ip: activeQuery.ip };
  }, [activeQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveQuery({ ip: hostIpInput, network: netInput });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input
          id="member-ip"
          name="hostIp"
          label="Host IP"
          value={hostIpInput}
          onChange={(e) => setHostIpInput(e.target.value)}
          placeholder="192.168.1.50…"
        />
        <Input
          id="member-net"
          name="network"
          label="Network"
          value={netInput}
          onChange={(e) => setNetInput(e.target.value)}
          placeholder="192.168.1.0/24…"
          hint="CIDR or “IP mask”"
        />
        <div className="sm:col-span-2">
          <Button type="submit" variant="primary">
            Check
          </Button>
        </div>
      </form>

      <div className="mt-6" aria-live="polite">
        {result.error && <p className="toolkit-error">{result.error}</p>}
        {result.subnet && (
          <ResultBox
            icon={<Crosshair size={16} weight="bold" />}
            title="Membership check"
            badge={`${result.subnet.network}/${result.subnet.prefix}`}
            note={`Host ${result.ip} tested against the parent network.`}
          >
            <div
              className={
                result.belongs
                  ? 'toolkit-verdict toolkit-verdict--ok'
                  : 'toolkit-verdict toolkit-verdict--bad'
              }
            >
              <span className="toolkit-verdict-icon" aria-hidden="true">
                {result.belongs ? (
                  <CheckCircle size={16} weight="fill" />
                ) : (
                  <XCircle size={16} weight="fill" />
                )}
              </span>
              <span translate="no" className="min-w-0">
                {result.ip} {result.belongs ? 'belongs to' : 'does not belong to'}{' '}
                {result.subnet.network}/{result.subnet.prefix}
              </span>
            </div>

            <DataList
              rows={[
                {
                  label: 'Network',
                  value: `${result.subnet.network}/${result.subnet.prefix}`,
                  mono: true,
                },
                { label: 'Mask', value: result.subnet.mask, mono: true },
                {
                  label: 'Range',
                  value: `${result.subnet.network} - ${result.subnet.broadcast}`,
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
