/**
 * Standardized chart colors and theming utilities
 * Uses CSS custom properties for consistent theme support
 */

export const chartColors = {
  primary: 'var(--color-chart-blue)',
  secondary: 'var(--color-chart-green)',
  accent: 'var(--color-chart-purple)',
  warning: 'var(--color-chart-orange)',
  info: 'var(--color-chart-teal)',
  danger: 'var(--color-chart-rose)',
} as const;

export const chartColorArray = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.accent,
  chartColors.warning,
  chartColors.info,
  chartColors.danger,
];

/**
 * Get standardized chart colors from CSS custom properties
 */
export function getChartColors(count: number = 6): string[] {
  return chartColorArray.slice(0, count);
}

/**
 * Get Chart.js compatible theme configuration
 */
export function getChartTheme(isDark: boolean = false) {
  return {
    backgroundColor: 'transparent',
    borderColor: isDark ? 'rgb(38, 38, 38)' : 'rgb(229, 231, 235)',
    gridColor: isDark ? 'rgb(64, 64, 64)' : 'rgb(243, 244, 246)',
    textColor: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
    tooltipBg: isDark ? 'rgb(17, 24, 39)' : 'rgb(255, 255, 255)',
    tooltipBorder: isDark ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)',
  };
}

/**
 * Get standardized Chart.js options with theme support
 */
export function getBaseChartOptions(isDark: boolean = false) {
  const theme = getChartTheme(isDark);
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 12,
          weight: '600',
        },
        bodyFont: {
          size: 11,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: theme.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: theme.textColor,
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: theme.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: theme.textColor,
          font: {
            size: 11,
          },
        },
      },
    },
  };
}

/**
 * Create a dataset with standardized styling
 */
export function createChartDataset(
  label: string,
  data: number[],
  options: {
    colorIndex?: number;
    fill?: boolean;
    tension?: number;
    backgroundColor?: string;
    borderColor?: string;
  } = {}
) {
  const {
    colorIndex = 0,
    fill = false,
    tension = 0.3,
    backgroundColor,
    borderColor,
  } = options;

  const color = chartColorArray[colorIndex % chartColorArray.length];
  
  return {
    label,
    data,
    backgroundColor: backgroundColor || (fill ? `${color}20` : color),
    borderColor: borderColor || color,
    borderWidth: 2,
    fill,
    tension,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: color,
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
  };
}

/**
 * Get heatmap color with consistent theming
 */
export function getHeatmapColor(value: number, maxValue: number, isDark: boolean = false): string {
  const intensity = Math.min(value / maxValue, 1);
  
  if (isDark) {
    return `rgba(96, 165, 250, ${intensity})`; // blue-400 with opacity
  } else {
    return `rgba(59, 130, 246, ${intensity})`; // blue-500 with opacity
  }
}

/**
 * Validate chart data structure
 */
export function validateChartData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.labels)) return false;
  if (!Array.isArray(data.datasets)) return false;
  
  return data.datasets.every((dataset: any) => 
    dataset && 
    typeof dataset.label === 'string' &&
    Array.isArray(dataset.data)
  );
}