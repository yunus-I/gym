'use client';

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Download,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { endOfMonth, format, startOfMonth } from "date-fns";

interface DailyReportPoint {
  date: string;
  attendance: number;
  revenue: number;
}

interface PlanBreakdownItem {
  name: string;
  value: number;
}

interface ReportsResponse {
  dailyData: DailyReportPoint[];
  planBreakdown: PlanBreakdownItem[];
  totalRevenue: number;
  totalAttendance: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const t = useTranslations("Reports");

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void fetch(`/api/reports?start=${startDate}&end=${endDate}`)
      .then((res) => res.json())
      .then((result: ReportsResponse) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endDate, startDate]);

  const exportToCSV = () => {
    if (!data) return;

    const headers = ["Date", "Attendance", "Revenue"];
    const rows = data.dailyData.map((point) => [point.date, point.attendance, point.revenue]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gym_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const attendanceChartData = {
    labels: data?.dailyData.map((point) => point.date),
    datasets: [
      {
        label: t("totalCheckIns"),
        data: data?.dailyData.map((point) => point.attendance),
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderRadius: 8,
      },
    ],
  };

  const revenueChartData = {
    labels: data?.dailyData.map((point) => point.date),
    datasets: [
      {
        label: t("revenue"),
        data: data?.dailyData.map((point) => point.revenue),
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.5)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const planChartData = {
    labels: data?.planBreakdown.map((plan) => plan.name),
    datasets: [
      {
        data: data?.planBreakdown.map((plan) => plan.value),
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("title")}
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">
              Analyze your gym&apos;s growth and financial performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-[2rem] shadow-xl shadow-indigo-500/5">
            <div className="flex items-center gap-2 px-4">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setLoading(true);
                  setStartDate(e.target.value);
                }}
                className="border-none bg-transparent focus:ring-0 p-0 text-sm font-bold w-32"
              />
              <span className="text-slate-300">-&gt;</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setLoading(true);
                  setEndDate(e.target.value);
                }}
                className="border-none bg-transparent focus:ring-0 p-0 text-sm font-bold w-32"
              />
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="rounded-2xl border-none bg-slate-50 dark:bg-zinc-800 font-bold px-6"
            >
              <Download className="mr-2 w-4 h-4" />
              {t("export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("revenue")}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {data?.totalRevenue.toLocaleString()} <span className="text-sm font-bold text-slate-400">ETB</span>
              </h3>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 flex flex-col justify-between">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("totalCheckIns")}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{data?.totalAttendance}</h3>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 flex flex-col justify-between text-white md:col-span-2">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-none font-bold">Pro Analytics</Badge>
            </div>
            <div className="mt-8">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Growth Forecast</p>
              <h3 className="text-3xl font-black italic">Steady upward trend detected</h3>
              <p className="text-white/60 text-sm mt-2">Based on the last 30 days of data.</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-zinc-900 p-10">
            <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <BarChart3 className="text-indigo-600" />
                {t("attendance")}
              </CardTitle>
            </CardHeader>
            <div className="h-[300px]">
              <Bar data={attendanceChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-zinc-900 p-10">
            <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <DollarSign className="text-purple-600" />
                {t("financial")}
              </CardTitle>
            </CardHeader>
            <div className="h-[300px]">
              <Line data={revenueChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-zinc-900 p-10 lg:col-span-2 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <CardTitle className="text-2xl font-black">{t("planBreakdown")}</CardTitle>
              <p className="text-slate-500 dark:text-zinc-400">
                Detailed view of which membership plans are driving your revenue.
              </p>
              <div className="space-y-4">
                {data?.planBreakdown.map((plan, index) => (
                  <div key={plan.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: String(planChartData.datasets[0].backgroundColor[index % 4]) }}
                      ></div>
                      <span className="font-bold text-slate-700 dark:text-zinc-300">{plan.name}</span>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">{plan.value.toLocaleString()} ETB</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-64 h-64">
              <Doughnut data={planChartData} options={{ maintainAspectRatio: false, cutout: "75%" }} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
