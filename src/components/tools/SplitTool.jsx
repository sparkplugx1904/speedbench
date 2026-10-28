import React, { useState, useMemo } from 'react';
import { SplitHorizontal } from '@phosphor-icons/react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DataList } from '../ui/DataList';
import { ResultBox } from '../ui/ResultBox';
import { parseIpv4, parseMask, calculateSubnet, formatNumber } from '../../utils/ip-math';

export function SplitTool() {
  const [parentInput, setParentInput] = useState('10.0.0.0/16');
  const [prefixInput, setPrefixInput] = useState('24');
  const [activeQuery, setActiveQuery] = useState({ parent: '10.0.0.0/16', newPrefix: '24' });

  const result = useMemo(() => {
    const slashIdx = activeQuery.parent.indexOf('/');
    if (slashIdx === -1) {
      return { error: 'Parent must be CIDR (e.g. 10.0.0.0/16).' };
    }
    const ipRes = parseIpv4(activeQuery.parent.slice(0, slashIdx));
    if (!ipRes.ok) return { error: ipRes.error };
    const maskRes = parseMask(activeQuery.parent.slice(slashIdx));
    if (!maskRes.ok) return { error: maskRes.error };
    const childMaskRes = parseMask(activeQuery.newPrefix);
    if (!childMaskRes.ok) return { error: childMaskRes.error };

    const parentPrefix = maskRes.value.prefix;
    const childPrefix = childMaskRes.value.prefix;

    if (childPrefix < parentPrefix) {
      return {
        error: 'New prefix must be longer than (or equal to) the parent.',
      };
    }
    if (childPrefix > 32) return { error: 'Prefix cannot exceed /32.' };

    const parentSubnet = calculateSubnet(ipRes.value, parentPrefix);
    const subnetCount = 2 ** (childPrefix - parentPrefix);

    if (subnetCount > 256) {
      return {
        error: `That split creates ${formatNumber(subnetCount)} subnets. Cap is 256 for display. Choose a smaller jump.`,
      };
    }

    const blockSize = 2 ** (32 - childPrefix);
    const networks = Array.from({ length: subnetCount }, (_, idx) => {
      const childSub = calculateSubnet(
        (parentSubnet.networkInt + idx * blockSize) >>> 0,
        childPrefix,
      );
      return {
        cidr: `${childSub.network}/${childPrefix}`,
        range: `${childSub.firstHost ?? childSub.network} - ${childSub.lastHost ?? childSub.broadcast}`,
        hosts: formatNumber(childSub.usableHosts),
      };
    });

    return {
      error: null,
      summary: [
        {
          label: 'Parent',
          value: `${parentSubnet.network}/${parentPrefix}`,
          mono: true,
          emphasize: true,
        },
        { label: 'Child prefix', value: `/${childPrefix}`, mono: true },
        { label: 'Subnets', value: formatNumber(subnetCount) },
        {
          label: 'Usable per subnet',
          value: formatNumber(calculateSubnet(0, childPrefix).usableHosts),
        },
        {
          label: 'Parent span',
          value: `${parentSubnet.network} - ${parentSubnet.broadcast}`,
          mono: true,
        },
      ],
      networks,
    };
  }, [activeQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveQuery({ parent: parentInput, newPrefix: prefixInput });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input
          id="split-parent"
          name="parent"
          label="Parent CIDR"
          value={parentInput}
          onChange={(e) => setParentInput(e.target.value)}
          placeholder="10.0.0.0/16…"
        />
        <Input
          id="split-child"
          name="newPrefix"
          label="New prefix"
          value={prefixInput}
          onChange={(e) => setPrefixInput(e.target.value)}
          placeholder="24…"
          hint="Longer than the parent"
        />
        <div className="sm:col-span-2">
          <Button type="submit" variant="primary">
            Split
          </Button>
        </div>
      </form>

      <div className="mt-6" aria-live="polite">
        {result.error && <p className="toolkit-error">{result.error}</p>}
        {result.summary && result.networks && (
          <ResultBox
            icon={<SplitHorizontal size={16} weight="bold" />}
            title="Subnet plan"
            badge={`${result.summary[2].value} subnets`}
            badgeTone="accent"
          >
            <DataList rows={result.summary} />
            <div className="toolkit-table-wrap">
              <table className="toolkit-table w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Subnet</th>
                    <th className="px-3 py-2 font-medium">Usable range</th>
                    <th className="px-3 py-2 font-medium">Hosts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {result.networks.map((item, idx) => (
                    <tr key={item.cidr}>
                      <td className="px-3 py-2 tabular-nums text-(--muted)">{idx + 1}</td>
                      <td className="is-mono px-3 py-2" translate="no">
                        {item.cidr}
                      </td>
                      <td className="is-mono px-3 py-2" translate="no">
                        {item.range}
                      </td>
                      <td className="px-3 py-2 tabular-nums">{item.hosts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultBox>
        )}
      </div>
    </Card>
  );
}
