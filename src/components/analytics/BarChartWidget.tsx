import React from "react";
import { Bar } from "react-chartjs-2";
import BaseChartWidget from './BaseChartWidget';
import { getBaseChartOptions, getChartColors, validateChartData } from '@/lib/analytics/chart-theme';
import { useTheme } from 'next-themes';
import ChartJS from './ChartSetup';

type BarChartWidgetProps = {
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

const BarChartWidget: React.FC<BarChartWidgetProps> = ({ title, data, options, isLoading, error, className, onRetry }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Validate data
  const dataError = data && !validateChartData(data) ? 'Invalid chart data format' : null;
  const finalError = error || dataError;

  // Apply consistent theming to data
  const themedData = data ? {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || getChartColors(data.datasets.length)[index % getChartColors().length],
      borderColor: dataset.backgroundColor || getChartColors(data.datasets.length)[index % getChartColors().length],
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }))
  } : null;

  // Merge with base theme options
  const chartOptions = {
    ...getBaseChartOptions(isDark),
    ...options,
    plugins: {
      ...getBaseChartOptions(isDark).plugins,
      ...options?.plugins,
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
      {themedData && <Bar key={`bar-${JSON.stringify(themedData.labels)}`} data={themedData} options={chartOptions} />}
    </BaseChartWidget>
  );
};

export default BarChartWidget;