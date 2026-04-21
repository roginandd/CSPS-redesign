import { useState } from "react";
import Layout from "../../components/Layout";
import EventHistoryModal from "./components/EventHistory";
import MyQrModal from "./components/MyQrModal";
import RecentEvents from "./components/RecentEvents";
import UpcomingEvents from "./components/UpcomingEvents";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import { useAuthStore } from "../../store/auth_store";
import type { StudentResponse } from "../../interfaces/student/StudentResponse";

const Index = () => {
  const user = useAuthStore((state) => state.user);
  const student = user?.role === "STUDENT" ? (user as StudentResponse) : null;
  const [myQrOpen, setMyQrOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <Layout>
      <AuthenticatedNav />

      <div className="w-full max-w-[95rem] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Page Header */}
        <div className="py-10 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Explore Events
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium max-w-xl">
              Stay connected with the community through our latest workshops,
              seminars, and social gatherings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <button
              onClick={() => setMyQrOpen(true)}
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10 backdrop-blur-sm shrink-0 active:scale-95 shadow-xl"
            >
              <svg
                className="w-4 h-4 text-[#FDE006]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
                <path d="M14 14h2v2h-2zM18 14h2v6h-6v-2M14 18h2v2h-2z" />
              </svg>
              My QR
            </button>

            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10 backdrop-blur-sm shrink-0 active:scale-95 shadow-xl"
            >
              <svg
                className="w-4 h-4 text-[#FDE006]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              My History
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12 pb-24">
          <UpcomingEvents />
          <RecentEvents />
        </div>
      </div>

      {student && myQrOpen && (
        <MyQrModal student={student} onClose={() => setMyQrOpen(false)} />
      )}

      {/* History Modal */}
      <EventHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </Layout>
  );
};

export default Index;
