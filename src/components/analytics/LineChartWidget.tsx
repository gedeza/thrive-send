import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type LineChartWidgetProps = {
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }[];
  };
  options?: object;
};

const LineChartWidget: React.FC<LineChartWidgetProps> = ({ title, data, options }) => (
  <div style={{ width: '100%', height: 220 }}>
    <h4 className="text-center mb-2">{title}</h4>
    <Line data={data} options={options} />
  </div>
);

export default LineChartWidget;