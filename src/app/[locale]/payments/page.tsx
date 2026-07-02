'use client';

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, CreditCard, Loader2, Filter, Search, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string | null;
  member: {
    fullName: string;
    memberId: number;
    photoUrl: string | null;
  };
  plan: {
    name: string;
  };
}

export default function PaymentsPage() {
  const t = useTranslations("Payments");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/payments")
      .then((res) => res.json())
      .then((data: PaymentRecord[]) => {
        if (!cancelled) setPayments(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const exportCSV = () => {
    if (payments.length === 0) return;
    const headers = ["Member", "Member ID", "Plan", "Amount (ETB)", "Date", "Payment Method"];
    const rows = payments.map((p) => [
      p.member.fullName,
      p.member.memberId,
      p.plan.name,
      p.amount,
      format(new Date(p.paymentDate), "yyyy-MM-dd"),
      p.paymentMethod
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${format(new Date(), "yyyy_MM_dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.member.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.member.memberId.toString().includes(search);
    const matchesMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded">Financials</span>
          <h1 className="text-3xl font-black text-white mt-3 uppercase tracking-tight leading-none">Payments & Revenue</h1>
          <p className="text-zinc-400 text-xs mt-2 max-w-xl font-medium">Review and download billing history, audit logged transactions, and analyze payment types.</p>
        </div>

        <button 
          onClick={exportCSV}
          disabled={payments.length === 0}
          className="bg-transparent border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <Download className="w-4 h-4 text-zinc-400" />
          Export CSV
        </button>
      </div>

      {/* Financial Analytics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <Card className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors relative overflow-hidden group">
          <div className="absolute inset-0 bg-radial from-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gross Processed Revenue</span>
            <div className="p-2 rounded-lg bg-white/5 text-[#FF6B00]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="my-6 relative z-10">
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                {totalRevenue.toLocaleString()}
              </h2>
              <span className="text-xs font-bold text-zinc-500 uppercase">ETB</span>
            </div>
            <p className="text-[9px] text-[#00FF88] font-black uppercase tracking-wider mt-2.5 flex items-center gap-1">
              ★ Billing logs synchronized in real-time
            </p>
          </div>

          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-white/[0.01] p-3 rounded-xl border border-white/5 relative z-10">
            Audit logs matching client database records.
          </div>
        </Card>


      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#151515] p-4 rounded-2xl border border-white/5 shadow-xl">
        {/* Search */}
        <div className="relative group w-full md:flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name or member ID..."
            className="w-full h-11 pl-11 pr-4 text-xs bg-white/[0.02] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:outline-none"
          />
        </div>

        {/* Method Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pl-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-500" /> Method
          </span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-11 px-4 text-xs bg-[#151515] border border-white/10 rounded-xl text-white focus:border-[#FF6B00] outline-none cursor-pointer w-full md:w-44 transition-all"
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-24 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-10 h-10 animate-spin text-[#FF6B00] mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Loading Transaction Registry...</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-4.5 px-6 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Member</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subscription Plan</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Amount</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Payment Method</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-zinc-500 italic text-xs bg-transparent">
                        No transactions found matching the filter options.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group">
                        {/* Member */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <Avatar className="w-9 h-9 ring-1 ring-white/10">
                              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C39] text-black text-xs font-black">
                                {p.member.fullName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm font-bold text-white block leading-none group-hover:text-[#FF6B00] transition-colors">{p.member.fullName}</span>
                              <span className="text-[10px] font-mono text-zinc-500 mt-1.5 block">ID: #{p.member.memberId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-4 text-xs font-bold text-zinc-300">
                          {p.plan.name}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 text-xs font-black text-[#00FF88] font-mono">
                          {p.amount.toLocaleString()} ETB
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-xs font-medium text-zinc-400 font-mono">
                          {format(new Date(p.paymentDate), "MMM dd, yyyy")}
                        </td>

                        {/* Payment Method Badge */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#090909] border border-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-300">
                            <CreditCard className={`w-3.5 h-3.5 ${p.paymentMethod === "Bank Transfer" ? "text-blue-400" : "text-[#FF6B00]"}`} />
                            {p.paymentMethod}
                          </span>
                        </td>

                        {/* Status badge pill */}
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/10">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
