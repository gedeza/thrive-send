import React from "react";
import { Line } from "react-chartjs-2";
import BaseChartWidget from './BaseChartWidget';
import { getBaseChartOptions, createChartDataset, validateChartData } from '@/lib/analytics/chart-theme';
import { useTheme } from 'next-themes';
import ChartJS from './ChartSetup';

type LineChartWidgetProps = {
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean | string;
    }[];
  };
  options?: object;
  isLoading?: boolean;
  error?: Error | string | null;
  className?: string;
  onRetry?: () => void;
};

const LineChartWidget: React.FC<LineChartWidgetProps> = ({ title, data, options, isLoading, error, className, onRetry }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Validate data
  const dataError = data && !validateChartData(data) ? 'Invalid chart data format' : null;
  const finalError = error || dataError;

  // Apply consistent theming to data
  const themedData = data ? {
    ...data,
    datasets: data.datasets.map((dataset, index) => 
      createChartDataset(dataset.label, dataset.data, {
        colorIndex: index,
        fill: dataset.fill || false,
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.borderColor,
      })
    )
  } : null;

  // Merge with base theme options
  const chartOptions = {
    ...getBaseChartOptions(isDark),
    ...options,
    plugins: {
      ...getBaseChartOptions(isDark).plugins,
      ...options?.plugins,
    },
    elements: {
      line: {
        tension: 0.3,
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
      {themedData && <Line key={`line-${JSON.stringify(themedData.labels)}`} data={themedData} options={chartOptions} />}
    </BaseChartWidget>
  );
};

export default LineChartWidget;
