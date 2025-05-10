import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type BarChartWidgetProps = {
  title: string;
  data: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
  };
  options?: object;
};

const BarChartWidget: React.FC<BarChartWidgetProps> = ({ title, data, options }) => (
  <div style={{ width: '100%', height: 220 }}>
    <h4 className="text-center mb-2">{title}</h4>
    <Bar data={data} options={options} />
  </div>
);

export default BarChartWidget;