'use client';

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Loader2,
  Phone,
  Calendar,
  CreditCard,
  Hash,
} from "lucide-react";
import { formatDate, formatETB } from "@/lib/format";

interface AttendanceSummary {
  id: string;
  checkIn: string;
}

interface PlanSummary {
  name: string;
  duration: number;
  price: number;
}

interface CheckInMember {
  id: string;
  memberId: number;
  fullName: string;
  phoneNumber: string | null;
  photoUrl: string | null;
  age: number | null;
  gender: string | null;
  status: string;
  expiryDate: string | null;
  registrationDate: string;
  currentPlan: PlanSummary | null;
  attendances: AttendanceSummary[];
  checkedInToday: boolean;
  todayCheckInTime: string | null;
}

export default function CheckInPage() {
  const t = useTranslations("CheckIn");
  const membersT = useTranslations("Members");
  const common = useTranslations("Common");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CheckInMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<CheckInMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const searchMembers = useCallback(async (val: string) => {
    const trimmed = val.trim();
    const isNumeric = /^\d+$/.test(trimmed);
    if ((!isNumeric && trimmed.length < 2) || (isNumeric && trimmed.length < 1)) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/check-in?query=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data = (await res.json()) as CheckInMember[];
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchMembers(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchMembers]);

  const performCheckIn = async (memberId: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      const data = (await res.json()) as { error?: string };

      if (res.ok) {
        setMessage({ type: "success", text: t("success") });
        setSelectedMember(null);
        setQuery("");
        setResults([]);
      } else if (data.error === "Already checked in today") {
        setMessage({ type: "error", text: t("alreadyCheckedIn") });
      } else if (data.error === "Subscription expired") {
        setMessage({ type: "error", text: t("subscriptionExpired") });
      } else {
        setMessage({ type: "error", text: common("error") });
      }
    } catch {
      setMessage({ type: "error", text: common("error") });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedMember) return;
    await performCheckIn(selectedMember.id);
  };

  const selectMember = (member: CheckInMember) => {
    setSelectedMember(member);
    setResults([]);
    setQuery("");
    setMessage(null);
  };

  const isExpired = Boolean(
    selectedMember && (!selectedMember.expiryDate || new Date(selectedMember.expiryDate) < new Date())
  );
  const isExpiringSoon = Boolean(
    selectedMember?.expiryDate &&
      new Date(selectedMember.expiryDate) > new Date() &&
      new Date(selectedMember.expiryDate) < new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  );
  const canCheckIn = selectedMember && !isExpired && !selectedMember.checkedInToday;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded">Check-in Terminal</span>
        <h1 className="text-3xl font-black text-white mt-3 uppercase tracking-tight leading-none">{t("title")}</h1>
        <p className="text-zinc-400 text-xs mt-2 font-medium">{t("subtitle")}</p>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
          {searching ? <Loader2 className="w-5 h-5 animate-spin text-[#FF6B00]" /> : <Search className="w-5 h-5" />}
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (selectedMember) {
                void handleCheckIn();
              } else if (results.length > 0) {
                void performCheckIn(results[0].id);
              }
            }
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full h-12 pl-12 pr-4 text-sm bg-[#151515] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none"
        />

        {results.length > 0 && !selectedMember && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#151515]/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-50 shadow-2xl divide-y divide-white/5">
            {results.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => selectMember(member)}
                className="w-full p-3.5 hover:bg-white/5 flex items-center gap-3.5 transition-colors border-none cursor-pointer text-left"
              >
                <Avatar className="w-10 h-10 ring-1 ring-white/10">
                  <AvatarImage src={member.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-[#090909] text-[#FF6B00] font-black text-xs">
                    {member.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-none">{member.fullName}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-semibold">ID: #{member.memberId}</p>
                </div>
                {member.checkedInToday && (
                  <span className="text-[9px] font-black text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    {t("checkedInToday")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3.5 text-xs font-bold uppercase tracking-wider ${
            message.type === "success"
              ? "bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 animate-pulse"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {selectedMember && (
        <Card className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C39]" />
          
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 ring-2 ring-white/10">
                  <AvatarImage src={selectedMember.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-[#090909] text-[#FF6B00] text-lg font-black">
                    {selectedMember.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#151515] ${
                    isExpired ? "bg-red-500" : isExpiringSoon ? "bg-[#FF6B00]" : "bg-[#00FF88]"
                  }`}
                >
                  {isExpired ? (
                    <AlertCircle className="w-4 h-4 text-white" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  )}
                </div>
              </div>

              <h2 className="text-lg font-black text-white uppercase tracking-tight">{selectedMember.fullName}</h2>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 font-semibold">MEMBER ID: #{selectedMember.memberId}</p>

              {selectedMember.checkedInToday && (
                <span className="mt-3.5 inline-flex items-center gap-1.5 text-[9px] font-black text-[#00FF88] bg-[#00FF88]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("alreadyCheckedIn")} · {selectedMember.todayCheckInTime && formatDate(selectedMember.todayCheckInTime, "HH:mm")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem icon={Hash} label={membersT("id")} value={`#${selectedMember.memberId}`} />
              <InfoItem icon={Phone} label={membersT("phoneNumber")} value={selectedMember.phoneNumber ?? "—"} />
              <InfoItem icon={User} label={membersT("age")} value={selectedMember.age?.toString() ?? "—"} />
              <InfoItem icon={User} label={membersT("gender")} value={selectedMember.gender ?? "—"} />
              <InfoItem
                icon={CreditCard}
                label={membersT("plan")}
                value={selectedMember.currentPlan?.name ?? "—"}
              />
              <InfoItem
                icon={Calendar}
                label={t("expiryDate")}
                value={
                  selectedMember.expiryDate
                    ? formatDate(selectedMember.expiryDate)
                    : "—"
                }
              />
              <InfoItem
                icon={CheckCircle2}
                label={t("status")}
                value={isExpired ? t("expired") : isExpiringSoon ? t("expiringSoon") : t("active")}
                highlight={isExpired ? "danger" : isExpiringSoon ? "warning" : "success"}
              />
              <InfoItem
                icon={Clock}
                label={t("lastVisit")}
                value={
                  selectedMember.attendances[0]
                    ? formatDate(selectedMember.attendances[0].checkIn, "MMM dd, HH:mm")
                    : "—"
                }
              />
            </div>

            {selectedMember.currentPlan && (
              <div className="text-[10px] font-bold text-zinc-400 p-3.5 rounded-xl bg-white/[0.01] border border-white/5 uppercase tracking-wider">
                Plan Details: {selectedMember.currentPlan.name} · {selectedMember.currentPlan.duration} days ·{" "}
                <span className="text-[#FF6B00]">{formatETB(selectedMember.currentPlan.price)}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMember(null);
                  setQuery("");
                }}
                className="flex-1 h-11 rounded-xl border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 font-bold text-xs uppercase tracking-widest cursor-pointer"
              >
                {common("cancel")}
              </Button>
              <Button
                disabled={loading || !canCheckIn}
                onClick={handleCheckIn}
                className={`flex-[2] h-11 rounded-xl font-black text-xs uppercase tracking-widest border-none cursor-pointer transition-all ${
                  canCheckIn
                    ? "bg-[#FF6B00] hover:bg-[#E05E00] text-white shadow-lg shadow-[#FF6B00]/15"
                    : "bg-white/5 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : t("checkIn")}
              </Button>
            </div>

            {isExpired && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-wider text-center animate-pulse">{t("subscriptionExpired")}</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: "success" | "warning" | "danger";
}) {
  const valueColor =
    highlight === "danger"
      ? "text-red-500"
      : highlight === "warning"
        ? "text-[#FF6B00]"
        : highlight === "success"
          ? "text-[#00FF88]"
          : "text-white";

  return (
    <div className="bg-white/[0.01] p-3.5 rounded-xl border border-white/5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      </div>
      <p className={`text-xs font-bold truncate ${valueColor}`}>{value}</p>
    </div>
  );
}
