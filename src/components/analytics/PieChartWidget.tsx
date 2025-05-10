import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type PieChartWidgetProps = {
  title: string;
  data: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
  };
  options?: object;
};

const PieChartWidget: React.FC<PieChartWidgetProps> = ({ title, data, options }) => (
  <div style={{ width: '100%', height: 220 }}>
    <h4 className="text-center mb-2">{title}</h4>
    <Pie data={data} options={options} />
  </div>
);

export default PieChartWidget;