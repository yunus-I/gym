'use client';

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  Plus, 
  AlertTriangle, 
  Users, 
  UserCheck, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  UserX,
  ArrowUpRight
} from "lucide-react";
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

function AttendanceChart() {
  const points = "20,120 60,105 100,110 140,75 180,85 220,55 260,65 300,40 340,45 380,25 420,30 460,15 500,20 540,10";
  const areaPoints = "20,120 60,105 100,110 140,75 180,85 220,55 260,65 300,40 340,45 380,25 420,30 460,15 500,20 540,10 540,150 20,150";
  
  return (
    <div className="relative h-[200px] w-full mt-6">
      <svg className="w-full h-full" viewBox="0 0 560 150" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30" x2="560" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="0" y1="70" x2="560" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="0" y1="110" x2="560" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <polygon points={areaPoints} fill="url(#chartGradient)" />
        <polyline
          fill="none"
          stroke="#FF6B00"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx="220" cy="55" r="4.5" fill="#FFFFFF" stroke="#FF6B00" strokeWidth="2.5" />
        <circle cx="380" cy="25" r="4.5" fill="#FFFFFF" stroke="#FF6B00" strokeWidth="2.5" />
        <circle cx="540" cy="10" r="4.5" fill="#FFFFFF" stroke="#FF6B00" strokeWidth="2.5" />
      </svg>
      <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}

function RevenueBarChart() {
  const bars = [
    { label: "Jan", val: 40 },
    { label: "Feb", val: 55 },
    { label: "Mar", val: 45 },
    { label: "Apr", val: 65 },
    { label: "May", val: 80 },
    { label: "Jun", val: 95 },
  ];
  return (
    <div className="flex items-end justify-between h-[200px] w-full pt-4 px-2">
      {bars.map((bar, idx) => (
        <div key={idx} className="flex flex-col items-center flex-1 group">
          <div className="relative w-7 bg-zinc-900 rounded-t-lg overflow-hidden h-[130px] transition-all duration-300 group-hover:bg-[#FF6B00]/10">
            <div 
              style={{ height: `${bar.val}%` }} 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#FF6B00] to-[#FF8C39] rounded-t-lg shadow-lg shadow-[#FF6B00]/10 transition-all duration-500"
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2 group-hover:text-white transition-colors">{bar.label}</span>
        </div>
      ))}
    </div>
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
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
      </div>
    );

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <p className="text-zinc-500 font-semibold tracking-wider">Unable to load dashboard data.</p>
      </div>
    );
  }

  const urgentCount = data.expiredMembers.length;

  const statCards = [
    { 
      label: "Total Members", 
      value: data.stats.totalMembers, 
      icon: Users,
      trend: "+8.2%", 
      isPositive: true,
      desc: "All registrations"
    },
    { 
      label: "Active Members", 
      value: data.stats.activeSubscriptions, 
      icon: UserCheck,
      trend: "+12.4%", 
      isPositive: true,
      desc: "Valid subscriptions"
    },
    { 
      label: "Today's Check-ins", 
      value: data.stats.todayCheckIns, 
      icon: Activity,
      trend: "+5.1%", 
      isPositive: true,
      desc: "Gym entries today"
    },
    { 
      label: "Monthly Revenue", 
      value: data.stats.monthlyRevenue, 
      icon: DollarSign,
      suffix: " ETB",
      trend: "+15.8%", 
      isPositive: true,
      desc: "Processed billing"
    },
    { 
      label: "Growth Rate", 
      value: data.stats.newSignupsThisWeek, 
      icon: TrendingUp,
      trend: "+20.0%", 
      isPositive: true,
      desc: "Sign-ups this week"
    },
    { 
      label: "Expired Accounts", 
      value: data.stats.expiredSubscriptions, 
      icon: UserX,
      trend: "-3.1%", 
      isPositive: false,
      desc: "Overdue memberships"
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#151515] to-[#0D0D0D] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute right-[-10%] top-[-20%] w-[350px] h-[350px] bg-[#FF6B00]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded">Performance Hub</span>
            <h1 className="text-3xl md:text-4xl font-black text-white mt-3 uppercase tracking-tight leading-none">Strength & Growth</h1>
            <p className="text-zinc-400 text-xs mt-2 max-w-xl font-medium leading-relaxed">Command hub for real-time gym analytics. Track daily active member check-ins, view revenue analytics, and manage membership renewals.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {urgentCount > 0 && (
              <button
                type="button"
                onClick={() => setShowUrgent(!showUrgent)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 hover:bg-red-900/40 transition-all cursor-pointer font-bold text-xs uppercase tracking-wider border-solid"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Alerts ({urgentCount})</span>
              </button>
            )}
            <Button
              onClick={() => router.push("/members/register")}
              className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF6B00]/15 active:scale-97 border-none cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </div>
      </div>

      {/* Urgent Payment List */}
      {showUrgent && urgentCount > 0 && (
        <Card className="bg-[#151515] border border-red-500/20 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Payment Overdue</h4>
                <p className="text-xs text-zinc-500">
                  {urgentCount} member{urgentCount !== 1 ? "s" : ""} currently have expired subscriptions.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowUrgent(false)}
              className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider bg-transparent border-none cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
            {data.expiredMembers.map((member) => {
              const daysOverdue = member.expiryDate
                ? differenceInDays(new Date(), new Date(member.expiryDate))
                : null;

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => router.push(`/members/${member.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:border-red-500/30 hover:bg-white/[0.03] transition-all cursor-pointer text-left border-solid"
                >
                  <Avatar className="w-9 h-9 shrink-0 ring-1 ring-white/10">
                    <AvatarImage src={member.photoUrl ?? undefined} />
                    <AvatarFallback className="bg-red-500/10 text-red-500 text-xs font-black">
                      {member.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-none">{member.fullName}</p>
                    <p className="text-[10px] text-zinc-500 leading-none mt-1">
                      ID #{member.memberId}
                      {member.currentPlan?.name && ` · ${member.currentPlan.name}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-red-500">
                      {member.expiryDate
                        ? format(new Date(member.expiryDate), "MMM dd")
                        : "No plan"}
                    </p>
                    {daysOverdue !== null && daysOverdue >= 0 && (
                      <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">
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

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={i} 
              className="p-5 flex flex-col justify-between bg-[#151515] border border-white/5 rounded-2xl shadow-xl hover:border-white/10 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              {/* Radial glow background on hover */}
              <div className="absolute inset-0 bg-radial from-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{stat.label}</span>
                <div className="p-2 rounded-lg bg-white/5 text-[#FF6B00] group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-5 relative z-10">
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${stat.isPositive ? 'text-[#00FF88] bg-[#00FF88]/10' : 'text-zinc-400 bg-white/5'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold">{stat.desc}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Attendance Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance chart card */}
        <Card className="lg:col-span-2 p-6 bg-[#151515] border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Attendance Analytics</h4>
                <p className="text-xs text-zinc-500">Live peak hours tracking overview.</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded">
                Live Status
              </span>
            </div>
            <AttendanceChart />
          </div>
        </Card>
        
        {/* Revenue chart card */}
        <Card className="p-6 bg-[#151515] border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Revenue Growth</h4>
                <p className="text-xs text-zinc-500">Monthly billing distribution logs.</p>
              </div>
              <div className="p-1 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00]">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <RevenueBarChart />
          </div>
        </Card>

        {/* Real-time Attendance Check-in Feed */}
        <Card className="lg:col-span-3 bg-[#151515] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Live Check-in feed</h4>
              <p className="text-xs text-zinc-500">Active member entries logged today.</p>
            </div>
            <span className="text-[10px] font-black text-zinc-400 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full uppercase tracking-wider">
              Total Today: {data.stats.todayCheckIns}
            </span>
          </div>

          {data.recentCheckIns.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 italic text-xs border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              No recent check-ins logged today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recentCheckIns.map((checkIn) => {
                const expiry = checkIn.member.expiryDate ? new Date(checkIn.member.expiryDate) : null;
                const isExpired = expiry ? expiry < new Date() : true;

                return (
                  <div 
                    key={checkIn.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-[#FF6B00]/20 hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10 ring-1 ring-white/10">
                          <AvatarImage src={memberPhotoPath(checkIn.member.photoUrl)} />
                          <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C39] text-black text-xs font-black">
                            {checkIn.member.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#151515] ${isExpired ? 'bg-red-500' : 'bg-[#00FF88]'}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate leading-none group-hover:text-[#FF6B00] transition-colors">{checkIn.member.fullName}</span>
                        <span className="text-[10px] text-zinc-500 block leading-none mt-1.5 font-semibold">{checkIn.member.currentPlan?.name ?? "Daily Pass"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-400 block font-semibold">{format(new Date(checkIn.checkIn), "HH:mm")}</span>
                      <span className={`inline-block text-[9px] uppercase tracking-wider font-black mt-1.5 ${isExpired ? 'text-red-400' : 'text-[#00FF88]'}`}>
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function memberPhotoPath(path: string | null) {
  if (!path) return undefined;
  return path;
}
