import { Users, Mail, MousePointerClick, Activity } from "lucide-react";
import type { StatCard } from "../dashboard.mock-data";

// Mapping between icon string and Lucide icon component
const iconMap = {
  users: Users,
  mail: Mail,
  click: MousePointerClick,
  activity: Activity,
};

export function StatSummaryCard({ title, value, icon, desc }: StatCard) {
  const Icon = iconMap[icon];
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}

export default StatSummaryCard;