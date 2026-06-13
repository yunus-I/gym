'use client';

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, CheckCircle2, AlertCircle, Clock, User, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AttendanceSummary {
  id: string;
  checkIn: string;
}

interface CheckInMember {
  id: string;
  memberId: number;
  fullName: string;
  photoUrl: string | null;
  expiryDate: string | null;
  attendances?: AttendanceSummary[];
}

export default function CheckInPage() {
  const t = useTranslations("CheckIn");
  const common = useTranslations("Common");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CheckInMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<CheckInMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const searchMembers = useCallback(async (val: string) => {
    if (val.length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/check-in?query=${encodeURIComponent(val)}`);
      
      if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        setResults([]);
        return;
      }

      const text = await res.text();
      if (!text) {
        setResults([]);
        return;
      }

      const data = JSON.parse(text) as CheckInMember[];
      setResults(data);
    } catch (e) {
      console.error("Failed to parse check-in data:", e);
      setResults([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMembers(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchMembers]);

  const handleCheckIn = async () => {
    if (!selectedMember) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: t("success") });
        setSelectedMember(null);
        setQuery("");
      } else {
        setMessage({ type: 'error', text: data.error === "Already checked in today" ? t("alreadyCheckedIn") : t("subscriptionExpired") });
      }
    } catch {
      setMessage({ type: 'error', text: common("error") });
    } finally {
      setLoading(false);
    }
  };

  const currentTime = new Date();
  const isExpired = Boolean(
    selectedMember?.expiryDate && new Date(selectedMember.expiryDate) < new Date()
  );
  const isExpiringSoon = Boolean(
    selectedMember?.expiryDate &&
      new Date(selectedMember.expiryDate) > new Date() &&
      new Date(selectedMember.expiryDate) < new Date(currentTime.getTime() + 5 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8 mt-12">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-zinc-400">
            Quickly check in members by name or ID.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-16 pl-14 pr-6 rounded-[2rem] border-none shadow-2xl shadow-indigo-500/10 bg-white dark:bg-zinc-900 text-lg focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          
          {results.length > 0 && !selectedMember && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-50">
              {results.map((member) => (
                <div
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member);
                    setResults([]);
                    setQuery("");
                  }}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-4 transition-colors border-b border-slate-50 dark:border-zinc-800 last:border-none"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.photoUrl ?? undefined} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{member.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">ID: {member.memberId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
          }`}>
            {message.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        {selectedMember && (
          <Card className="rounded-[3rem] border-none shadow-2xl shadow-indigo-500/10 bg-white dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardContent className="p-10">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <Avatar className="w-40 h-40 border-8 border-slate-50 dark:border-zinc-800 shadow-xl">
                    <AvatarImage src={selectedMember.photoUrl ?? undefined} />
                    <AvatarFallback className="bg-slate-100 dark:bg-zinc-800 text-slate-400">
                      <User className="w-16 h-16" />
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-lg ${
                    isExpired ? 'bg-rose-500' : isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}>
                    {isExpired ? <AlertCircle className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">{selectedMember.fullName}</h2>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs mt-1">
                    Member ID: {selectedMember.memberId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("status")}</p>
                    <p className={`font-bold ${isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {isExpired ? t("expired") : isExpiringSoon ? t("expiringSoon") : t("active")}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Expiry Date</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {selectedMember.expiryDate ? format(new Date(selectedMember.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedMember.attendances?.[0] && (
                   <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 text-sm">
                     <Clock className="w-4 h-4" />
                     <span>{t("lastVisit")}: {format(new Date(selectedMember.attendances[0].checkIn), 'MMM dd, HH:mm')}</span>
                   </div>
                )}

                <div className="flex gap-4 w-full pt-4">
                  <Button
                    variant="outline"
                    onClick={() => { setSelectedMember(null); setQuery(""); }}
                    className="flex-1 h-16 rounded-2xl border-slate-200 dark:border-zinc-800 font-bold"
                  >
                    {common("cancel")}
                  </Button>
                  <Button
                    disabled={loading || isExpired}
                    onClick={handleCheckIn}
                    className={`flex-[2] h-16 rounded-2xl font-black text-xl shadow-lg transition-all transform active:scale-95 ${
                      isExpired ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : t("checkIn")}
                  </Button>
                </div>
                
                {isExpired && (
                  <p className="text-rose-500 font-bold text-sm animate-pulse">
                    {t("subscriptionExpired")} Renew plan to check in.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
