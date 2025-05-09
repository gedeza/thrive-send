// Install dependencies if not done:
// npm install chart.js react-chartjs-2

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

// Register components (needed for Chart.js v3+)
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function ChartjsTwoToneBarDemo() {
  // Updated tones: blue and green
  const BLUE = "#1976d2";
  const GREEN = "#43a047";

  // Alternate colors for each bar
  const verticalBarColors = [BLUE, GREEN, BLUE, GREEN];
  const horizontalBarColors = [GREEN, BLUE, GREEN, BLUE];

  const verticalData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Monthly UVs",
        data: [400, 300, 500, 200],
        backgroundColor: verticalBarColors, // Alternate blue & green
      }
    ]
  };
  const horizontalData = {
    labels: ["Feature A", "Feature B", "Feature C", "Feature D"],
    datasets: [
      {
        label: "Feature Usage",
        data: [140, 220, 90, 300],
        backgroundColor: horizontalBarColors, // Alternate green & blue
      }
    ]
  };

  const verticalOptions = {
    responsive: true,
    plugins: { legend: { display: true } }
  } as const;

  const horizontalOptions = {
    responsive: true,
    indexAxis: 'y' as const, // Horizontal!
    plugins: { legend: { display: true } }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, width: "100%" }}>
      <div style={{ flex: 1, minWidth: 320, height: 300 }}>
        <h3 style={{ textAlign: "center" }}>Vertical - Monthly UVs</h3>
        <Bar data={verticalData} options={verticalOptions} />
      </div>
      <div style={{ flex: 1, minWidth: 320, height: 300 }}>
        <h3 style={{ textAlign: "center" }}>Horizontal - Features Usage</h3>
        <Bar data={horizontalData} options={horizontalOptions} />
      </div>
    </div>
  );
}

export default ChartjsTwoToneBarDemo;