import React from "react";
import { Calendar, Megaphone, ShoppingCart, User } from "lucide-react";

export interface ActivityItem {
  id: string | number;
  type: "ORDER" | "MEMBERSHIP" | "ANNOUNCEMENT" | "EVENT";
  title: string;
  subtitle: string;
  time: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const iconMap = {
  ORDER: {
    icon: ShoppingCart,
    color: "text-amber-200",
    bg: "bg-amber-500/10",
  },
  MEMBERSHIP: {
    icon: User,
    color: "text-emerald-200",
    bg: "bg-emerald-500/10",
  },
  ANNOUNCEMENT: {
    icon: Megaphone,
    color: "text-sky-200",
    bg: "bg-sky-500/10",
  },
  EVENT: {
    icon: Calendar,
    color: "text-purple-200",
    bg: "bg-purple-500/10",
  },
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 animate-pulse">
            <span className="h-11 w-11 rounded-full border border-white/10 bg-[#1a1635]" />
            <div className="space-y-3 pt-1">
              <p className="h-4 w-1/3 rounded bg-[#1a1635]" />
              <p className="h-3 w-1/2 rounded bg-[#1a1635]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1635] px-5 py-10 text-center">
        <p className="text-sm font-medium text-white">No recent activity yet.</p>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Orders and membership updates will appear here when they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[21px] top-2 w-px bg-white/10" />

      <ul className="relative space-y-6">
        {activities.map((activity) => {
          const config = iconMap[activity.type];

          return (
            <li
              key={`${activity.type}-${activity.id}`}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-4"
            >
              <span
                className={`z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#110e31] ${config.bg} ${config.color}`}
              >
                <config.icon size={16} />
              </span>
              <div className="min-w-0 pt-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {activity.title}
                  </h3>
                  <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wide text-white/40">
                    {activity.time}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  {activity.subtitle}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActivityFeed;
