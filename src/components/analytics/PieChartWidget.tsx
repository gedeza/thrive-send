import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

type PieChartWidgetProps = {
  title: string;
  data: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
  };
  options?: object;
  isLoading?: boolean;
  className?: string;
};

const PieChartWidget: React.FC<PieChartWidgetProps> = ({ title, data, options, isLoading, className }) => {
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-[300px] w-full">
          <Pie data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChartWidget;