import React, { useState, useMemo } from 'react';
import { Hash } from '@phosphor-icons/react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DataList } from '../ui/DataList';
import { ResultBox } from '../ui/ResultBox';
import {
  parseMask,
  prefixToMaskInt,
  prefixHostCounts,
  hostsToPrefix,
  intToIpv4,
  intToBinaryIpv4,
  formatNumber,
} from '../../utils/ip-math';

export function MasksTool() {
  const [maskInput, setMaskInput] = useState('24');
  const [hostsInput, setHostsInput] = useState('254');
  const [activeTab, setActiveTab] = useState('mask');
  const [activeQuery, setActiveQuery] = useState({ mode: 'mask', value: '24' });

  const result = useMemo(() => {
    if (activeQuery.mode === 'hosts') {
      const num = Number(activeQuery.value);
      const res = hostsToPrefix(num);
      if (!res.ok) return { error: res.error };
      const mask = prefixToMaskInt(res.value);
      const counts = prefixHostCounts(res.value);
      return {
        error: null,
        badge: `/${res.value}`,
        rows: [
          { label: 'Needed hosts', value: formatNumber(num) },
          { label: 'Prefix', value: `/${res.value}`, emphasize: true, mono: true },
          { label: 'Subnet mask', value: intToIpv4(mask), mono: true },
          { label: 'Wildcard', value: intToIpv4(~mask >>> 0), mono: true },
          { label: 'Total addresses', value: formatNumber(counts.total) },
          { label: 'Usable hosts', value: formatNumber(counts.usable) },
          { label: 'Binary mask', value: intToBinaryIpv4(mask), mono: true },
        ],
      };
    }

    const res = parseMask(activeQuery.value);
    if (!res.ok) return { error: res.error };
    const { prefix, mask } = res.value;
    const counts = prefixHostCounts(prefix);
    return {
      error: null,
      badge: `/${prefix}`,
      rows: [
        { label: 'Prefix', value: `/${prefix}`, emphasize: true, mono: true },
        { label: 'Subnet mask', value: intToIpv4(mask), mono: true },
        { label: 'Wildcard', value: intToIpv4(~mask >>> 0), mono: true },
        { label: 'Host bits', value: String(32 - prefix) },
        { label: 'Total addresses', value: formatNumber(counts.total) },
        { label: 'Usable hosts', value: formatNumber(counts.usable) },
        { label: 'Binary mask', value: intToBinaryIpv4(mask), mono: true },
      ],
    };
  }, [activeQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveQuery({
      mode: activeTab,
      value: activeTab === 'mask' ? maskInput : hostsInput,
    });
  };

  return (
    <Card>
      <div role="tablist" aria-label="Converter mode" className="toolkit-tabs">
        {[
          { id: 'mask', label: 'Mask / prefix' },
          { id: 'hosts', label: 'Hosts needed' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className="toolkit-tab"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        {activeTab === 'mask' ? (
          <Input
            id="mask-in"
            name="mask"
            label="Mask or prefix"
            value={maskInput}
            onChange={(e) => setMaskInput(e.target.value)}
            placeholder="/24 or 255.255.255.0…"
          />
        ) : (
          <Input
            id="hosts-in"
            name="hosts"
            label="Usable hosts needed"
            type="number"
            inputMode="numeric"
            min={1}
            value={hostsInput}
            onChange={(e) => setHostsInput(e.target.value)}
            placeholder="254…"
          />
        )}
        <Button type="submit" variant="primary" className="w-fit">
          Convert
        </Button>
      </form>

      <div className="mt-6" aria-live="polite">
        {result.error && <p className="toolkit-error">{result.error}</p>}
        {result.rows && (
          <ResultBox
            icon={<Hash size={16} weight="bold" />}
            title="Mask conversion"
            badge={result.badge}
            badgeTone="accent"
          >
            <DataList rows={result.rows} />
          </ResultBox>
        )}
      </div>
    </Card>
  );
}
