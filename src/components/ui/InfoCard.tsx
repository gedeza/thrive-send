import React from "react";

interface InfoCardProps {
  title: string;
  description: string;
  chip?: string;
  color?: "primary" | "secondary" | "accent" | "info" | "warning" | "success";
}

// Simple mapping for accent colors; extend as needed
const colorClasses: Record<string, string> = {
  primary: "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
  secondary: "bg-gray-100 border border-gray-300 text-gray-800",
  accent: "bg-yellow-100 border border-yellow-300 text-yellow-800",
  info: "bg-blue-50 border border-blue-200 text-blue-800",
  warning: "bg-orange-50 border border-orange-300 text-orange-900",
  success: "bg-green-50 border border-green-300 text-green-800"
};

const chipClasses =
  "inline-block px-2 py-0.5 text-xs font-semibold rounded-full ml-2 bg-white/70 border";

const InfoCard: React.FC<InfoCardProps> = ({ title, description, chip, color = "primary" }) => (
  <div className={`p-4 rounded-md shadow hover:shadow-lg transition ${colorClasses[color]} relative`}>
    <div className="flex items-center mb-2">
      <span className="text-lg font-bold">{title}</span>
      {chip && <span className={chipClasses}>{chip}</span>}
    </div>
    <p className="text-sm">{description}</p>
  </div>
);

export default InfoCard;