'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  UserPlus, 
  BarChart3, 
  Clock,
  Loader2,
  User
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface DashboardStats {
  totalMembers: number;
  todayCheckIns: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  monthlyRevenue: number;
}

interface ExpiringMember {
  id: string;
  fullName: string;
  expiryDate: string;
  photoUrl: string | null;
}

interface RecentCheckIn {
  id: string;
  checkIn: string;
  member: {
    fullName: string;
    photoUrl: string | null;
  };
}

interface DashboardResponse {
  stats: DashboardStats;
  expiringSoon: ExpiringMember[];
  recentCheckIns: RecentCheckIn[];
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
    </div>
  );

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <p className="text-slate-500 dark:text-zinc-400">Unable to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12 space-y-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("title")}
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">
              Welcome back! Here&apos;s what&apos;s happening at your gym today.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push("/members/register")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-6 font-bold shadow-lg shadow-indigo-500/20"
            >
              <UserPlus className="mr-2 w-5 h-5" />
              {t("quickActions")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: t("totalMembers"), value: data.stats.totalMembers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
            { label: t("todayCheckIns"), value: data.stats.todayCheckIns, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: t("activeSubs"), value: data.stats.activeSubscriptions, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-100" },
            { label: t("expiredSubs"), value: data.stats.expiredSubscriptions, icon: XCircle, color: "text-rose-600", bg: "bg-rose-100" },
            { label: t("revenue"), value: `${data.stats.monthlyRevenue.toLocaleString()} ETB`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100" },
          ].map((stat, i) => (
            <Card key={i} className="rounded-[2.5rem] border-none shadow-xl shadow-indigo-500/5 bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
              <div className={`w-12 h-12 ${stat.bg} dark:bg-opacity-10 rounded-2xl flex items-center justify-center ${stat.color} mb-6`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts Section */}
          <Card className="lg:col-span-1 rounded-[3rem] border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 dark:border-zinc-800 flex flex-row items-center justify-between bg-rose-50/30 dark:bg-rose-900/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-rose-500" />
                <CardTitle className="text-xl font-black">{t("alerts")}</CardTitle>
              </div>
              <span className="bg-rose-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                {data.expiringSoon.length}
              </span>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {data.expiringSoon.length === 0 ? (
                <p className="text-center py-10 text-slate-400 font-medium italic">No urgent alerts.</p>
              ) : (
                data.expiringSoon.map((member) => (
                  <div 
                    key={member.id} 
                    onClick={() => router.push(`/members/${member.id}`)}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-white dark:border-zinc-900 shadow-md">
                        <AvatarImage src={member.photoUrl ?? undefined} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">{member.fullName}</p>
                        <p className="text-xs text-rose-500 font-bold">
                          {differenceInDays(new Date(member.expiryDate), new Date())} {t("daysRemaining")}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 dark:border-zinc-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="text-indigo-600" />
                <CardTitle className="text-xl font-black">{t("recentActivity")}</CardTitle>
              </div>
              <Button variant="ghost" className="rounded-xl text-indigo-600 font-bold hover:bg-indigo-50" onClick={() => router.push("/check-in")}>
                {t("viewAll")}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                {data.recentCheckIns.map((activity) => (
                  <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12 shadow-sm">
                          <AvatarImage src={activity.member.photoUrl ?? undefined} />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{activity.member.fullName}</p>
                        <p className="text-xs text-slate-400 font-medium">Checked in from Ticker Panel</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{format(new Date(activity.checkIn), 'HH:mm')}</p>
                      <p className="text-xs text-slate-400">{format(new Date(activity.checkIn), 'MMM dd')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shortcut Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Register", icon: UserPlus, path: "/members/register", color: "bg-blue-50 text-blue-600" },
            { label: "Check-In", icon: CheckCircle, path: "/check-in", color: "bg-emerald-50 text-emerald-600" },
            { label: "Records", icon: Users, path: "/members", color: "bg-indigo-50 text-indigo-600" },
            { label: "Reports", icon: BarChart3, path: "/reports", color: "bg-purple-50 text-purple-600" },
          ].map((item, i) => (
            <Button
              key={i}
              onClick={() => router.push(item.path)}
              variant="ghost"
              className={`h-32 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all transform hover:-translate-y-2 hover:shadow-xl ${item.color} border-none`}
            >
              <item.icon className="w-8 h-8" />
              <span className="font-black tracking-tight">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
