import { Card } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  change: string;
}

export function MetricCard({ title, value, change }: MetricCardProps) {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{value}</p>
        <span
          className={`ml-2 flex items-baseline text-sm font-semibold ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
          ) : isNegative ? (
            <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
          ) : null}
          <span className="ml-1">{change}</span>
        </span>
      </div>
    </Card>
  );
} 