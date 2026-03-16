import React from "react";
import { CalendarPlus, FileText, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Schedule Event",
    description: "Open event management",
    icon: CalendarPlus,
    color: "text-purple-200",
    bg: "bg-purple-500/10",
    path: "/admin/event",
  },
  {
    title: "Grant Admin",
    description: "Assign administrative roles",
    icon: UserPlus,
    color: "text-emerald-200",
    bg: "bg-emerald-500/10",
    path: "/admin/students",
  },
  {
    title: "Draft Report",
    description: "Review sales and reporting",
    icon: FileText,
    color: "text-amber-200",
    bg: "bg-amber-500/10",
    path: "/admin/sales",
  },
];

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="grid gap-3">
      {actions.map((action) => (
        <button
          key={action.title}
          onClick={() => navigate(action.path)}
          className="group flex min-h-14 items-start gap-4 rounded-2xl border border-white/10 bg-[#1a1635] p-4 text-left transition-colors hover:border-purple-500/25 hover:bg-[#241d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110e31]"
          type="button"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${action.bg} ${action.color}`}
          >
            <action.icon size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white">
              {action.title}
            </span>
            <span className="mt-1 block text-sm leading-6 text-white/60">
              {action.description}
            </span>
          </span>
        </button>
      ))}
    </nav>
  );
};

export default QuickActions;
