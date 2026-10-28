import React, { useState, useMemo } from 'react';
import { Info } from '@phosphor-icons/react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DataList } from '../ui/DataList';
import { ResultBox } from '../ui/ResultBox';
import { parseIpv4, classifyIp, formatNumber } from '../../utils/ip-math';

export function IpInfoTool() {
  const [ipInput, setIpInput] = useState('8.8.8.8');
  const [activeQuery, setActiveQuery] = useState('8.8.8.8');

  const result = useMemo(() => {
    const parsed = parseIpv4(activeQuery);
    if (!parsed.ok) return { error: parsed.error, rows: null };
    const info = classifyIp(parsed.value);
    return {
      error: null,
      rows: [
        { label: 'Address', value: info.ip, mono: true, emphasize: true },
        { label: 'Kind', value: info.kind },
        { label: 'Class', value: info.classLetter },
        { label: 'Class span', value: info.classRange },
        { label: 'Binary', value: info.binary, mono: true },
        { label: 'Integer', value: formatNumber(info.integer), mono: true },
        { label: 'Hex', value: info.hex, mono: true },
        { label: 'Private', value: info.private ? 'Yes' : 'No' },
        { label: 'Loopback', value: info.loopback ? 'Yes' : 'No' },
        { label: 'Link-local', value: info.linkLocal ? 'Yes' : 'No' },
        { label: 'Multicast', value: info.multicast ? 'Yes' : 'No' },
        { label: 'CGNAT', value: info.cgnat ? 'Yes' : 'No' },
        { label: 'Documentation', value: info.documentation ? 'Yes' : 'No' },
      ],
    };
  }, [activeQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveQuery(ipInput);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Input
          id="info-ip"
          name="ip"
          label="IPv4 address"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="8.8.8.8…"
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
