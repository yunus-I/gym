'use client';

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { differenceInDays, format } from "date-fns";

interface DashboardStats {
  totalMembers: number;
  todayCheckIns: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  newSignupsThisWeek: number;
  monthlyRevenue: number;
}

interface ExpiredMember {
  id: string;
  memberId: number;
  fullName: string;
  expiryDate: string | null;
  photoUrl: string | null;
  phoneNumber: string | null;
  currentPlan: { name: string } | null;
}

interface RecentCheckIn {
  id: string;
  checkIn: string;
  member: {
    fullName: string;
    photoUrl: string | null;
    status: string;
    expiryDate: string | null;
    currentPlan: {
      name: string;
    } | null;
  };
}

interface DashboardResponse {
  stats: DashboardStats;
  expiredMembers: ExpiredMember[];
  recentCheckIns: RecentCheckIn[];
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const duration = 600;
    const increment = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        clearInterval(timer);
        setCount(value);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUrgent, setShowUrgent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/dashboard")
      .then((res) => res.json())
      .then((result: DashboardResponse) => {
        if (!cancelled) setData(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
        <Loader2 className="w-12 h-12 animate-spin text-[#22C55E]" />
      </div>
    );

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
        <p className="text-[#94A3B8]">Unable to load dashboard data.</p>
      </div>
    );
  }

  const urgentCount = data.expiredMembers.length;

  const statCards = [
    { label: "Total Members", value: data.stats.totalMembers },
    { label: "Active Today", value: data.stats.todayCheckIns },
    { label: "Monthly Revenue", value: data.stats.monthlyRevenue, suffix: " ETB" },
    { label: "New Sign-ups (Week)", value: data.stats.newSignupsThisWeek },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#F1F5F9] tracking-tight">Overview</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">Command hub and real-time operations overview.</p>
          </div>

          {urgentCount > 0 && (
            <button
              type="button"
              onClick={() => setShowUrgent(!showUrgent)}
              className="relative p-2.5 rounded-lg bg-[#7F1D1D]/30 border border-[#EF4444]/40 hover:bg-[#7F1D1D]/50 transition-colors cursor-pointer border-solid"
              title={`${urgentCount} member(s) with expired payment`}
              aria-label={`${urgentCount} urgent payment alerts`}
            >
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#EF4444] text-[#FFF] text-[10px] font-bold px-1">
                {urgentCount > 99 ? "99+" : urgentCount}
              </span>
            </button>
          )}
        </div>

        <Button
          onClick={() => router.push("/members/register")}
          className="bg-[#22C55E] hover:bg-[#1ea850] text-[#0F1117] font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-lg active:scale-97 border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {showUrgent && urgentCount > 0 && (
        <Card className="bg-[#1E2535] border border-[#EF4444]/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            <div>
              <h4 className="text-[15px] font-semibold text-[#F1F5F9]">Urgent — Payment Overdue</h4>
              <p className="text-[11px] text-[#94A3B8]">
                {urgentCount} member{urgentCount !== 1 ? "s" : ""} passed their payment due date.
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.expiredMembers.map((member) => {
              const daysOverdue = member.expiryDate
                ? differenceInDays(new Date(), new Date(member.expiryDate))
                : null;

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => router.push(`/members/${member.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#161B27] border border-[#2A3347] hover:border-[#EF4444]/50 hover:bg-[#1E2535] transition-colors cursor-pointer text-left border-solid"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={member.photoUrl ?? undefined} />
                    <AvatarFallback className="bg-[#2A3347] text-[#EF4444] text-xs font-bold">
                      {member.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#F1F5F9] truncate">{member.fullName}</p>
                    <p className="text-[11px] text-[#64748B]">
                      ID #{member.memberId}
                      {member.currentPlan?.name && ` · ${member.currentPlan.name}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#EF4444]">
                      {member.expiryDate
                        ? format(new Date(member.expiryDate), "MMM dd, yyyy")
                        : "No plan"}
                    </p>
                    {daysOverdue !== null && daysOverdue >= 0 && (
                      <p className="text-[10px] text-[#64748B]">
                        {daysOverdue === 0 ? "Due today" : `${daysOverdue}d overdue`}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between bg-[#1E2535] border border-[#2A3347] rounded-xl shadow-lg">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">{stat.label}</span>
            <h3 className="text-3xl font-extrabold text-[#F1F5F9] mt-4">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </h3>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1E2535] border border-[#2A3347] rounded-xl p-5">
        <div className="mb-4">
          <h4 className="text-[15px] font-semibold text-[#F1F5F9]">Recent Check-Ins</h4>
          <p className="text-[11px] text-[#94A3B8]">Active entries tracking details logged from the portal.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2A3347]">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Member</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Membership Plan</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Check-in Time</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCheckIns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[#94A3B8] italic text-xs">
                    No recent check-ins logged today.
                  </td>
                </tr>
              ) : (
                data.recentCheckIns.map((checkIn) => {
                  const expiry = checkIn.member.expiryDate ? new Date(checkIn.member.expiryDate) : null;
                  const isExpired = expiry ? expiry < new Date() : true;

                  return (
                    <tr key={checkIn.id} className="border-b border-[#2A3347] hover:bg-[#2A3347] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={checkIn.member.photoUrl ?? undefined} />
                            <AvatarFallback className="bg-[#161B27] text-[#22C55E] text-xs font-bold">
                              {checkIn.member.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-[#F1F5F9]">{checkIn.member.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-[#CBD5E1]">
                        {checkIn.member.currentPlan?.name ?? "Daily Pass"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-[#94A3B8]">
                        {format(new Date(checkIn.checkIn), "HH:mm (MMM dd)")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpired ? "bg-[#7F1D1D] text-[#EF4444]" : "bg-[#14532D] text-[#22C55E]"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
