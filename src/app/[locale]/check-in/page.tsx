'use client';

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { format } from "date-fns";

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9] tracking-tight">{t("title")}</h1>
        <p className="text-xs text-[#94A3B8] mt-0.5">{t("subtitle")}</p>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#94A3B8]">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </span>
        <Input
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
          className="h-11 pl-10 pr-4 text-sm bg-[#1E2535] border border-[#2A3347] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:border-[#22C55E] focus:outline-none"
        />

        {results.length > 0 && !selectedMember && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E2535] rounded-xl border border-[#2A3347] overflow-hidden z-50 shadow-xl">
            {results.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => selectMember(member)}
                className="w-full p-3 hover:bg-[#2A3347] flex items-center gap-3 transition-colors border-none cursor-pointer border-b border-[#2A3347] last:border-none text-left"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-[#161B27] text-[#22C55E]">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F1F5F9] truncate">{member.fullName}</p>
                  <p className="text-xs text-[#64748B]">ID: {member.memberId}</p>
                </div>
                {member.checkedInToday && (
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#14532D] px-2 py-0.5 rounded-full shrink-0">
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
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
            message.type === "success"
              ? "bg-[#14532D]/40 text-[#22C55E] border border-[#22C55E]/30"
              : "bg-[#7F1D1D]/40 text-[#EF4444] border border-[#EF4444]/30"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {selectedMember && (
        <Card className="bg-[#1E2535] border border-[#2A3347] rounded-xl overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 ring-2 ring-[#2A3347]">
                  <AvatarImage src={selectedMember.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-[#161B27] text-[#22C55E]">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#1E2535] ${
                    isExpired ? "bg-[#EF4444]" : isExpiringSoon ? "bg-[#F97316]" : "bg-[#22C55E]"
                  }`}
                >
                  {isExpired ? (
                    <AlertCircle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#F1F5F9]">{selectedMember.fullName}</h2>
              <p className="text-xs text-[#64748B] font-mono mt-1">#{selectedMember.memberId}</p>

              {selectedMember.checkedInToday && (
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] bg-[#14532D] px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("alreadyCheckedIn")} — {selectedMember.todayCheckInTime && format(new Date(selectedMember.todayCheckInTime), "HH:mm")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                    ? format(new Date(selectedMember.expiryDate), "MMM dd, yyyy")
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
                    ? format(new Date(selectedMember.attendances[0].checkIn), "MMM dd, HH:mm")
                    : "—"
                }
              />
            </div>

            {selectedMember.currentPlan && (
              <div className="text-xs text-[#94A3B8] p-3 rounded-lg bg-[#161B27] border border-[#2A3347]">
                {selectedMember.currentPlan.name} — {selectedMember.currentPlan.duration} days —{" "}
                {selectedMember.currentPlan.price.toLocaleString()} ETB
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMember(null);
                  setQuery("");
                }}
                className="flex-1 h-11 rounded-lg border-[#2A3347] bg-transparent text-[#CBD5E1] hover:bg-[#2A3347] font-semibold text-sm"
              >
                {common("cancel")}
              </Button>
              <Button
                disabled={loading || !canCheckIn}
                onClick={handleCheckIn}
                className={`flex-[2] h-11 rounded-lg font-bold text-sm border-none ${
                  canCheckIn
                    ? "bg-[#22C55E] hover:bg-[#1ea850] text-[#0F1117]"
                    : "bg-[#2A3347] text-[#64748B] cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("checkIn")}
              </Button>
            </div>

            {isExpired && (
              <p className="text-[#EF4444] text-xs font-semibold text-center">{t("subscriptionExpired")}</p>
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
      ? "text-[#EF4444]"
      : highlight === "warning"
        ? "text-[#F97316]"
        : highlight === "success"
          ? "text-[#22C55E]"
          : "text-[#F1F5F9]";

  return (
    <div className="bg-[#161B27] p-3 rounded-lg border border-[#2A3347]">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-[#64748B]" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{label}</p>
      </div>
      <p className={`text-sm font-semibold truncate ${valueColor}`}>{value}</p>
    </div>
  );
}
