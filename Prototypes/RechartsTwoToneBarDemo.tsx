// Install recharts if not done: npm install recharts

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const verticalData = [
  { label: "Jan", uv: 400 },
  { label: "Feb", uv: 300 },
  { label: "Mar", uv: 500 },
  { label: "Apr", uv: 200 },
];

const horizontalData = [
  { name: "Feature A", val: 140 },
  { name: "Feature B", val: 220 },
  { name: "Feature C", val: 90 },
  { name: "Feature D", val: 300 },
];

export default function RechartsTwoToneBarDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, width: "100%" }}>
      {/* Vertical Bar Chart: Use your brand-primary/blue tone */}
      <div style={{ flex: 1, minWidth: 320, height: 300 }}>
        <h3 style={{ textAlign: "center" }}>Vertical - Monthly UVs</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={verticalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="uv" fill="#1976d2" />  {/* Blue tone */}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Horizontal Bar Chart: Use an accent/pink or orange tone */}
      <div style={{ flex: 1, minWidth: 320, height: 300 }}>
        <h3 style={{ textAlign: "center" }}>Horizontal - Features Usage</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={horizontalData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="val" fill="#e57373" /> {/* Red/Accent tone */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}