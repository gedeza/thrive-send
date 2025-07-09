import React from "react";
import { Pie } from "react-chartjs-2";
import BaseChartWidget from './BaseChartWidget';
import { getBaseChartOptions, getChartColors, validateChartData } from '@/lib/analytics/chart-theme';
import { useTheme } from 'next-themes';
import ChartJS from './ChartSetup';

type PieChartWidgetProps = {
  title: string;
  data: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
  };
  options?: object;
  isLoading?: boolean;
  error?: Error | string | null;
  className?: string;
  onRetry?: () => void;
};

const PieChartWidget: React.FC<PieChartWidgetProps> = ({ title, data, options, isLoading, error, className, onRetry }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Validate data
  const dataError = data && !validateChartData(data) ? 'Invalid chart data format' : null;
  const finalError = error || dataError;

  // Apply consistent theming to data
  const themedData = data ? {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || getChartColors(data.labels.length),
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 4,
    }))
  } : null;

  // Merge with base theme options
  const chartOptions = {
    ...getBaseChartOptions(isDark),
    ...options,
    plugins: {
      ...getBaseChartOptions(isDark).plugins,
      ...options?.plugins,
      legend: {
        ...getBaseChartOptions(isDark).plugins.legend,
        position: 'bottom' as const,
        ...options?.plugins?.legend,
      },
    },
  };

  return (
    <BaseChartWidget
      title={title}
      isLoading={isLoading}
      error={finalError}
      className={className}
      onRetry={onRetry}
    >
      {themedData && <Pie key={`pie-${JSON.stringify(themedData.labels)}`} data={themedData} options={chartOptions} />}
    </BaseChartWidget>
  );
};

export default PieChartWidget;