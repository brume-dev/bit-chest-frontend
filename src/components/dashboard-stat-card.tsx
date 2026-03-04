import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}

export function StatCard({ icon, label, value, sub, positive }: Props) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-base-content/50">{label}</span>
          <span className="text-secondary/80">{icon}</span>
        </div>
        <p className="text-2xl font-bold text-neutral tracking-tight">{value}</p>
        {sub && (
          <p className={`text-xs font-semibold flex items-center gap-1 ${positive ? "text-success" : "text-error"}`}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
