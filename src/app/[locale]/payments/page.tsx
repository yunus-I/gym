'use client';

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9] tracking-tight">Payments & Revenue</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Audit payments and process member checkouts.
          </p>
        </div>

        <button 
          onClick={exportCSV}
          disabled={payments.length === 0}
          className="bg-transparent border border-[#2A3347] text-[#CBD5E1] hover:bg-[#2A3347] hover:text-[#F1F5F9] text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <Card className="bg-[#1E2535] border border-[#2A3347] rounded-xl p-5 flex flex-col justify-between max-w-md">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">Total Processed Revenue</span>
            <p className="text-xs text-[#94A3B8] mt-1">Audit log totals since gym initialization.</p>
          </div>

          <div className="my-6">
            <div className="flex items-center gap-2 text-[#22C55E]">
              <DollarSign className="w-8 h-8" />
              <h2 className="text-4xl font-extrabold text-[#F1F5F9]">
                {totalRevenue.toLocaleString()} <span className="text-sm font-semibold text-[#94A3B8]">ETB</span>
              </h2>
            </div>
            <p className="text-[10px] text-[#22C55E] font-bold mt-2 flex items-center gap-1">
              ★ Active billing integration operational
            </p>
          </div>

          <div className="text-[11px] text-[#94A3B8] p-3 rounded-lg bg-[#161B27] border border-[#2A3347]">
            Payments are directly synced with database schema records. Use Member profiles to record new checkout items.
          </div>
        </Card>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#1E2535] p-4 rounded-xl border border-[#2A3347]">
        {/* Search */}
        <div className="relative group w-full md:flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name or ID..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#1E2535] border border-[#2A3347] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:border-[#22C55E] focus:outline-none"
          />
        </div>

        {/* Method Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Method
          </span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#1E2535] border border-[#2A3347] rounded-lg text-[#F1F5F9] focus:border-[#22C55E] outline-none cursor-pointer"
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="bg-[#1E2535] border border-[#2A3347] rounded-xl overflow-hidden shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-[#94A3B8]">
              <Loader2 className="w-10 h-10 animate-spin text-[#22C55E] mb-3" />
              <p className="text-xs font-semibold uppercase tracking-wider">Loading logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2A3347]">
                    <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Member</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Subscription Plan</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Amount</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Date</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Payment Method</th>
                    <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#94A3B8] italic text-xs">
                        No transactions found matching the filter options.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="border-b border-[#2A3347] hover:bg-[#2A3347] transition-colors">
                        {/* Member */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-[#161B27] text-[#22C55E] text-xs font-bold">
                                {p.member.fullName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm font-semibold text-[#F1F5F9] block leading-none">{p.member.fullName}</span>
                              <span className="text-[10px] font-mono text-[#64748B] mt-1 block">#{p.member.memberId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-4 text-sm text-[#CBD5E1]">
                          {p.plan.name}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-sm font-bold text-[#22C55E]">
                          {p.amount.toLocaleString()} ETB
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-xs font-mono text-[#94A3B8]">
                          {format(new Date(p.paymentDate), "MMM dd, yyyy")}
                        </td>

                        {/* Payment Method Badge */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161B27] border border-[#2A3347] text-xs font-medium text-[#CBD5E1]">
                            <CreditCard className="w-3.5 h-3.5 text-[#3B82F6]" />
                            {p.paymentMethod}
                          </span>
                        </td>

                        {/* Status badge pill */}
                        <td className="py-3.5 px-6 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14532D] text-[#22C55E]">
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
