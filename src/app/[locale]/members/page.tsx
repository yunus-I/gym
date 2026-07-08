'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Eye, Loader2, Filter } from "lucide-react";
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
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load members: ${res.status}`);
        return res.json() as Promise<MemberListItem[]>;
      })
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch((error) => {
        console.error("Failed to load members:", error);
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
    const matchesSearch = 
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toString().includes(search);

    const isExpired = m.expiryDate ? new Date(m.expiryDate) < new Date() : true;
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && !isExpired) ||
      (statusFilter === "expired" && isExpired);

    const planName = m.currentPlan?.name?.toLowerCase() || "";
    const matchesPlan = 
      planFilter === "all" ||
      (planFilter === "monthly" && planName.includes("monthly")) ||
      (planFilter === "quarterly" && planName.includes("quarterly")) ||
      (planFilter === "yearly" && (planName.includes("yearly") || planName.includes("annual")));

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded">Directory</span>
          <h1 className="text-3xl font-black text-white mt-3 uppercase tracking-tight leading-none">Members Registry</h1>
          <p className="text-zinc-400 text-xs mt-2 max-w-xl font-medium">Search, filter, and audit all gym member profiles, billing statuses, and entry plans.</p>
        </div>

        <Button 
          onClick={() => router.push("/members/register")}
          className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF6B00]/15 active:scale-97 border-none cursor-pointer transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-[#151515] p-5 rounded-2xl border border-white/5 shadow-xl">
        {/* Search */}
        <div className="relative group w-full lg:flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#FF6B00] transition-colors">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name or ID number..."
            className="w-full h-11 pl-11 pr-4 text-xs bg-white/[0.02] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 pl-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-500" /> Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 text-xs bg-[#151515] border border-white/10 rounded-xl text-white focus:border-[#FF6B00] outline-none cursor-pointer w-full lg:w-44 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pl-1.5">Plan</span>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-11 px-4 text-xs bg-[#151515] border border-white/10 rounded-xl text-white focus:border-[#FF6B00] outline-none cursor-pointer w-full lg:w-44 transition-all"
          >
            <option value="all">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly / Annual</option>
          </select>
        </div>
      </div>

      {/* Members Grid/Table Container */}
      <Card className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-24 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-10 h-10 animate-spin text-[#FF6B00] mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Loading Member Registry...</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-4.5 px-6 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Member</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subscription Plan</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Join Date</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Expiry Date</th>
                    <th className="py-4.5 px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-zinc-500 italic text-xs bg-transparent">
                        No members found matching the search query or filters.
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
                        <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group">
                          {/* Avatar + Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <Avatar className="w-10 h-10 ring-1 ring-white/10 transition-transform group-hover:scale-105 duration-200">
                                <AvatarImage src={member.photoUrl ?? undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C39] text-black text-xs font-black">
                                  {member.fullName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-sm font-bold text-white block leading-none group-hover:text-[#FF6B00] transition-colors">{member.fullName}</span>
                                <span className="text-[10px] font-mono text-zinc-500 mt-1.5 block">ID: #{member.memberId}</span>
                              </div>
                            </div>
                          </td>

                          {/* Membership Plan */}
                          <td className="py-4 px-4 text-xs font-bold text-zinc-300">
                            {member.currentPlan?.name ?? "Daily Pass"}
                          </td>

                          {/* Join Date */}
                          <td className="py-4 px-4 text-xs font-medium text-zinc-400 font-mono">
                            {member.registrationDate ? format(new Date(member.registrationDate), 'MMM dd, yyyy') : 'N/A'}
                          </td>

                          {/* Expiry Date */}
                          <td className="py-4 px-4 text-xs font-medium text-zinc-400 font-mono">
                            {member.expiryDate ? format(new Date(member.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isExpired 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/10' 
                                : isExpiringSoon 
                                  ? 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/10'
                                  : 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/10'
                            }`}>
                              {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Active"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => router.push(`/members/${member.id}`)}
                                className="bg-transparent border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-zinc-400 group-hover:text-white" />
                                Profile
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
