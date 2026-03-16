import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

const shellClass =
  "rounded-[24px] border border-white/10 bg-[#110e31]/80 p-5 shadow-xl shadow-black/20 sm:p-6";

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <section className={`${shellClass} animate-pulse`}>
        <header className="mb-5 flex items-start justify-between gap-4">
          <span className="h-12 w-12 rounded-2xl border border-white/10 bg-[#1a1635]" />
          <span className="h-6 w-20 rounded-full bg-[#1a1635]" />
        </header>
        <p className="h-3 w-28 rounded bg-[#1a1635]" />
        <p className="mt-3 h-9 w-24 rounded bg-[#1a1635]" />
        <p className="mt-3 h-3 w-40 rounded bg-[#1a1635]" />
      </section>
    );
  }

  return (
    <section className={`${shellClass} transition-colors hover:border-purple-500/25`}>
      <header className="mb-5 flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#1a1635] text-purple-200">
          <Icon size={22} />
        </span>
        {trend && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              trend.isPositive
                ? "bg-emerald-500/15 text-emerald-200"
                : "bg-red-500/15 text-red-200"
            }`}
          >
            {trend.value}
          </span>
        )}
      </header>

      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
        {title}
      </p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </h3>
      {description && (
        <p className="mt-3 text-sm leading-6 text-white/62">{description}</p>
      )}
    </section>
  );
};

export default StatCard;
