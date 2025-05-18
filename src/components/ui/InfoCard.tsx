import React from "react";

interface InfoCardProps {
  title: string;
  description: string;
  chip?: string;
  color?: "primary" | "secondary" | "accent" | "info" | "warning" | "success";
}

// Simple mapping for accent colors; extend as needed
const colorClasses: Record<string, string> = {
  primary: "bg-primary-500 text-custom-white",
  secondary: "bg-neutral-card border border-neutral-border text-neutral-text",
  accent: "bg-accent-50 border border-accent-200 text-accent-700",
  info: "bg-primary-50 border border-primary-200 text-primary-700",
  warning: "bg-accent-50 border border-accent-200 text-accent-700",
  success: "bg-secondary-50 border border-secondary-200 text-secondary-700"
};

const chipClasses =
  "inline-block px-2 py-0.5 text-xs font-semibold rounded-full ml-2 bg-neutral-card/70 border border-neutral-border";

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