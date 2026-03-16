import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../../../components/AuthenticatedNav";
import {
  AlertTriangle,
  Calendar,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EventResponse } from "../../../interfaces/event/EventResponse";
import {
  getFinanceDashboard,
  type FinanceDashboardDTO,
} from "../../../api/dashboard";
import { getUpcomingEvents } from "../../../api/event";
import { S3_BASE_URL } from "../../../constant";
import Layout from "../../../components/Layout";
import StatCard from "./components/StatCard";
import QuickActions from "./components/QuickActions";
import ActivityFeed, { type ActivityItem } from "./components/ActivityFeed";

const cardShell =
  "rounded-[28px] border border-white/10 bg-[#110e31]/80 p-6 shadow-xl shadow-black/20 sm:p-8";

const normalizeUpcomingEvents = (value: unknown): EventResponse[] => {
  if (Array.isArray(value)) {
    return value as EventResponse[];
  }

  if (value && typeof value === "object") {
    const maybeContent = (value as { content?: unknown }).content;
    if (Array.isArray(maybeContent)) {
      return maybeContent as EventResponse[];
    }

    const maybeData = (value as { data?: unknown }).data;
    if (Array.isArray(maybeData)) {
      return maybeData as EventResponse[];
    }
  }

  return [];
};

const formatEventDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const Index = () => {
  const [dashboardData, setDashboardData] =
    useState<FinanceDashboardDTO | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [dash, events] = await Promise.all([
          getFinanceDashboard(),
          getUpcomingEvents(),
        ]);

        setDashboardData(dash);
        setUpcomingEvents(normalizeUpcomingEvents(events));
      } catch {
        setLoadError("Unable to load the dashboard right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const activities = useMemo<ActivityItem[]>(() => {
    if (!dashboardData) return [];

    const items: ActivityItem[] = [];

    dashboardData.recentOrders.slice(0, 3).forEach((order) => {
      items.push({
        id: order.orderItemId,
        type: "ORDER",
        title: `New order: ${order.productName}`,
        subtitle: `Ordered by ${order.studentName}`,
        time: "Recently",
      });
    });

    dashboardData.recentMemberships.slice(0, 3).forEach((member) => {
      items.push({
        id: member.studentId,
        type: "MEMBERSHIP",
        title: "New membership registration",
        subtitle: `${member.fullName} joined as a member`,
        time: "Recently",
      });
    });

    return items;
  }, [dashboardData]);

  const inventoryAlerts = useMemo(
    () =>
      dashboardData?.inventory.filter((item) => item.stockStatus !== "IN_STOCK") ??
      [],
    [dashboardData],
  );

  const nextEvents = useMemo(() => upcomingEvents.slice(0, 3), [upcomingEvents]);

  const memberPercentage =
    dashboardData?.membershipRatio.memberPercentage.toFixed(1) ?? "0.0";
  const nextEvent = nextEvents[0];

  return (
    <Layout>
      <main className="mx-auto w-full max-w-[92rem] px-4 pb-16 pt-6 text-white sm:px-6 lg:px-8">
        <AuthenticatedNav />

        <div className="mt-8 space-y-8 sm:mt-10 lg:space-y-10">
          <header className={`${cardShell} overflow-hidden`}>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.95fr)] xl:items-end">
              <div>
                <span className="inline-flex rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-100">
                  Admin Overview
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[3.25rem]">
                  Dashboard
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  Track student membership, merchandise health, and upcoming
                  organization activity from one place.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-[#1a1635] px-4 py-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Active Members
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {dashboardData?.membershipRatio.paidMembersCount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#1a1635] px-4 py-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Paid Ratio
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {memberPercentage}%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#1a1635] px-4 py-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Inventory Alerts
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {inventoryAlerts.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#1a1635] p-5 sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                  Current Focus
                </p>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  {nextEvent ? nextEvent.eventName : "No upcoming events"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {nextEvent
                    ? `${formatEventDate(nextEvent.eventDate)} at ${nextEvent.eventLocation}`
                    : "Once events are scheduled, the next one will appear here."}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    onClick={() => navigate("/admin/merch/products")}
                    className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1635]"
                    type="button"
                  >
                    Manage Store
                  </button>
                  <div className="rounded-xl border border-white/10 bg-[#140f33] px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Upcoming Events
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {upcomingEvents.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {loadError && (
            <section className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
              <p className="text-sm font-medium text-red-200">{loadError}</p>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Students"
              value={dashboardData?.membershipRatio.totalStudents ?? 0}
              icon={Users}
              isLoading={isLoading}
              description="Students tracked in the organization roster"
            />
            <StatCard
              title="Active Paid Members"
              value={dashboardData?.membershipRatio.paidMembersCount ?? 0}
              icon={LayoutDashboard}
              isLoading={isLoading}
              description={`${memberPercentage}% of all students`}
            />
            <StatCard
              title="Inventory Alerts"
              value={inventoryAlerts.length}
              icon={AlertTriangle}
              isLoading={isLoading}
              description={
                inventoryAlerts.length === 0
                  ? "No low-stock or out-of-stock items"
                  : "Products that need attention"
              }
            />
            <StatCard
              title="Upcoming Events"
              value={upcomingEvents.length}
              icon={Calendar}
              isLoading={isLoading}
              description={
                nextEvent
                  ? `Next: ${formatEventDate(nextEvent.eventDate)}`
                  : "No scheduled events"
              }
            />
          </section>

          <section className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
            <div className="space-y-8">
              <section className={cardShell}>
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Recent Activity
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Latest organization updates
                    </h2>
                  </div>
                  <span className="inline-flex rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-100">
                    {activities.length} item{activities.length === 1 ? "" : "s"}
                  </span>
                </header>
                <ActivityFeed activities={activities} isLoading={isLoading} />
              </section>

              <section className={cardShell}>
                <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Inventory Alerts
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Stock that needs action
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      Review low-stock and out-of-stock merchandise before it
                      affects orders.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/admin/merch/products")}
                    className="rounded-xl border border-white/10 bg-[#1a1635] px-4 py-3 text-sm font-semibold text-white/85 transition-colors hover:border-white/15 hover:bg-[#241d49] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110e31]"
                    type="button"
                  >
                    Manage Store
                  </button>
                </header>

                <div className="grid gap-4 md:grid-cols-2">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-28 animate-pulse rounded-2xl border border-white/10 bg-[#1a1635]"
                      />
                    ))
                  ) : inventoryAlerts.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-10 text-center">
                      <p className="text-sm font-medium text-emerald-200">
                        All items are currently stocked and ready.
                      </p>
                    </div>
                  ) : (
                    inventoryAlerts.map((item) => (
                      <article
                        key={item.id}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#1a1635] p-4"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#140f33] p-2">
                          <img
                            src={
                              item.s3ImageKey
                                ? `${S3_BASE_URL}${item.s3ImageKey}`
                                : "/placeholder.png"
                            }
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {item.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                item.stockStatus === "OUT_OF_STOCK"
                                  ? "bg-red-500/15 text-red-200"
                                  : "bg-amber-500/15 text-amber-200"
                              }`}
                            >
                              {item.stockStatus.replaceAll("_", " ")}
                            </span>
                            <span className="text-sm text-white/55">
                              {item.stock} left
                            </span>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-8">
              <section className={cardShell}>
                <header className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-200">
                    <Package size={18} />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                      Quick Actions
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      Common shortcuts
                    </h2>
                  </div>
                </header>
                <QuickActions />
              </section>

              <section className={cardShell}>
                <header className="mb-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                    Upcoming Events
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    What&apos;s scheduled next
                  </h2>
                </header>

                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-24 animate-pulse rounded-2xl border border-white/10 bg-[#1a1635]"
                      />
                    ))}
                  </div>
                ) : nextEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#1a1635] px-5 py-10 text-center">
                    <p className="text-sm font-medium text-white">
                      No upcoming events
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      Scheduled events will appear here once they are added.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nextEvents.map((event) => (
                      <article
                        key={event.eventId}
                        className="rounded-2xl border border-white/10 bg-[#1a1635] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-white">
                              {event.eventName}
                            </h3>
                            <p className="mt-1 text-sm text-white/60">
                              {event.eventLocation}
                            </p>
                          </div>
                          <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-100">
                            {event.eventStatus.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-white/70">
                          {formatEventDate(event.eventDate)}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </section>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
