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
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Eye, Loader2, User } from "lucide-react";
import { format } from "date-fns";

interface MemberListItem {
  id: string;
  memberId: number;
  fullName: string;
  photoUrl: string | null;
  expiryDate: string | null;
}

export default function MembersDirectoryPage() {
  const t = useTranslations("Members");
  const common = useTranslations("Common");
  const checkIn = useTranslations("CheckIn");
  const router = useRouter();

  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filteredMembers = members.filter((m) =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.memberId.toString().includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("title") || "Members Directory"}
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">
              View and manage all registered gym members.
            </p>
          </div>

          <Button 
            onClick={() => router.push("/members/register")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-bold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
          >
            <UserPlus className="mr-2 w-5 h-5" />
            {t("register")}
          </Button>
        </div>

        <div className="relative group max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={common("search") + "..."}
            className="h-12 pl-12 rounded-xl border-none shadow-lg shadow-indigo-500/5 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-500/5 bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-medium">Loading members...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-zinc-800">
                    <TableHead className="px-8 py-6 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {t("fullName")}
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {t("id")}
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {t("status")}
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      Expiry Date
                    </TableHead>
                    <TableHead className="px-8 text-right font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {common("actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-20 text-center text-slate-400">
                        No members found.
                      </TableCell>
                    </TableRow>
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
                        <TableRow key={member.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors border-slate-50 dark:border-zinc-800/50">
                          <TableCell className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10 border border-slate-100 dark:border-zinc-800">
                                <AvatarImage src={member.photoUrl ?? undefined} />
                                <AvatarFallback><User /></AvatarFallback>
                              </Avatar>
                              <span className="font-bold text-slate-900 dark:text-white">{member.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-500">
                            #{member.memberId}
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-full px-3 py-1 border-none font-bold ${
                              isExpired 
                                ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                                : isExpiringSoon 
                                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                              {isExpired ? checkIn("expired") : isExpiringSoon ? checkIn("expiringSoon") : checkIn("active")}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-500 dark:text-zinc-400">
                            {member.expiryDate ? format(new Date(member.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/members/${member.id}`)}
                              className="rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
