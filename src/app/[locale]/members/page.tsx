'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Eye, Loader2, User, Filter } from "lucide-react";
import { format } from "date-fns";

interface MemberListItem {
  id: string;
  memberId: number;
  fullName: string;
  photoUrl: string | null;
  registrationDate: string;
  expiryDate: string | null;
  currentPlan: {
    name: string;
    price: number;
  } | null;
}

export default function MembersDirectoryPage() {
  const t = useTranslations("Members");
  const common = useTranslations("Common");
  const router = useRouter();

  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/members")
      .then((res) => res.json())
      .then((data: MemberListItem[]) => {
        if (!cancelled) setMembers(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filtering Logic
  const filteredMembers = members.filter((m) => {
    // 1. Search Query (Name or ID)
    const matchesSearch = 
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toString().includes(search);

    // 2. Status check
    const isExpired = m.expiryDate ? new Date(m.expiryDate) < new Date() : true;
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && !isExpired) ||
      (statusFilter === "expired" && isExpired);

    // 3. Plan check
    const planName = m.currentPlan?.name?.toLowerCase() || "";
    const matchesPlan = 
      planFilter === "all" ||
      (planFilter === "monthly" && planName.includes("monthly")) ||
      (planFilter === "quarterly" && planName.includes("quarterly")) ||
      (planFilter === "yearly" && (planName.includes("yearly") || planName.includes("annual")));

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9] tracking-tight">Members Directory</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            View, search, filter, and manage all registered gym members.
          </p>
        </div>

        <Button 
          onClick={() => router.push("/members/register")}
          className="bg-[#22C55E] hover:bg-[#1ea850] text-[#0F1117] font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-lg active:scale-97 border-none cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

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
            placeholder="Search by name or Member ID..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#1E2535] border border-[#2A3347] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:border-[#22C55E] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#1E2535] border border-[#2A3347] rounded-lg text-[#F1F5F9] focus:border-[#22C55E] outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Plan</span>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#1E2535] border border-[#2A3347] rounded-lg text-[#F1F5F9] focus:border-[#22C55E] outline-none cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly / Annual</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <Card className="bg-[#1E2535] border border-[#2A3347] rounded-xl overflow-hidden shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-[#94A3B8]">
              <Loader2 className="w-10 h-10 animate-spin text-[#22C55E] mb-3" />
              <p className="text-xs font-semibold uppercase tracking-wider">Loading directory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2A3347]">
                    <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Member</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Membership Plan</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Join Date</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Expiry Date</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Status</th>
                    <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#94A3B8] italic text-xs">
                        No members match the current search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const isExpired = Boolean(
                        member.expiryDate && new Date(member.expiryDate) < new Date()
                      );
                      const isExpiringSoon = Boolean(
                        member.expiryDate &&
                          new Date(member.expiryDate) > new Date() &&
                          new Date(member.expiryDate) < new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000)
                      );

                      return (
                        <tr key={member.id} className="border-b border-[#2A3347] hover:bg-[#2A3347] transition-colors group">
                          {/* Avatar + Name */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarImage src={member.photoUrl ?? undefined} />
                                <AvatarFallback className="bg-[#161B27] text-[#22C55E] text-xs font-bold">
                                  {member.fullName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-sm font-semibold text-[#F1F5F9] block leading-none">{member.fullName}</span>
                                <span className="text-[10px] font-mono text-[#64748B] mt-1 block">#{member.memberId}</span>
                              </div>
                            </div>
                          </td>

                          {/* Membership Plan */}
                          <td className="py-3.5 px-4 text-sm text-[#CBD5E1]">
                            {member.currentPlan?.name ?? "Daily Pass"}
                          </td>

                          {/* Join Date */}
                          <td className="py-3.5 px-4 text-xs font-medium text-[#94A3B8]">
                            {member.registrationDate ? format(new Date(member.registrationDate), 'MMM dd, yyyy') : 'N/A'}
                          </td>

                          {/* Expiry Date */}
                          <td className="py-3.5 px-4 text-xs font-medium text-[#94A3B8]">
                            {member.expiryDate ? format(new Date(member.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isExpired 
                                ? 'bg-[#7F1D1D] text-[#EF4444]' 
                                : isExpiringSoon 
                                  ? 'bg-[#7C2D12] text-[#F97316]'
                                  : 'bg-[#14532D] text-[#22C55E]'
                            }`}>
                              {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Active"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => router.push(`/members/${member.id}`)}
                                className="bg-transparent border border-[#2A3347] text-[#CBD5E1] hover:bg-[#2A3347] hover:text-[#F1F5F9] text-xs font-semibold px-3 py-1 rounded-md"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                View Profile
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
