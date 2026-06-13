'use client';

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CreditCard,
  History,
  Loader2,
  User,
  ArrowLeft,
  TrendingUp,
  Clock,
  Save,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlanOption {
  id: string;
  name: string;
  price: number;
}

interface AttendanceRecord {
  id: string;
  checkIn: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  plan: {
    name: string;
  } | null;
}

interface MemberProfile {
  id: string;
  memberId: number;
  fullName: string;
  photoUrl: string | null;
  expiryDate: string | null;
  attendances: AttendanceRecord[];
  payments: PaymentRecord[];
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const p = useTranslations("Payments");
  const checkIn = useTranslations("CheckIn");
  const router = useRouter();

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetch(`/api/members/${id}`).then((res) => res.json() as Promise<MemberProfile>),
      fetch("/api/plans").then((res) => res.json() as Promise<PlanOption[]>),
    ]).then(([memberData, plansData]) => {
      if (!cancelled) {
        setMember(memberData);
        setPlans(plansData);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const refreshMember = async () => {
    const refreshedMember = (await fetch(`/api/members/${id}`).then((res) => res.json())) as MemberProfile;
    setMember(refreshedMember);
  };

  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingPayment(true);
    const formData = new FormData(e.currentTarget);

    const planId = formData.get("planId") as string;
    const selectedPlan = plans.find((plan) => plan.id === planId);

    const data = {
      memberId: id,
      planId,
      amount: selectedPlan?.price,
      paymentMethod: formData.get("paymentMethod"),
      notes: formData.get("notes"),
    };

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setIsPaymentDialogOpen(false);
      await refreshMember();
    }

    setSubmittingPayment(false);
  };

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isExpired = member.expiryDate ? new Date(member.expiryDate) < new Date() : false;
  const daysLeft = member.expiryDate ? differenceInDays(new Date(member.expiryDate), new Date()) : 0;
  const totalPaid = member.payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 -ml-2">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Directory
        </Button>

        <Card className="rounded-[3rem] border-none shadow-2xl shadow-indigo-500/5 bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-0">
            <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
            <div className="px-10 pb-10 -mt-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                  <Avatar className="w-40 h-40 border-8 border-white dark:border-zinc-900 shadow-2xl bg-white">
                    <AvatarImage src={member.photoUrl ?? undefined} />
                    <AvatarFallback><User className="w-16 h-16" /></AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left mb-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{member.fullName}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                      <Badge className="bg-indigo-600 text-white font-bold border-none px-4 py-1.5 rounded-full">
                        ID: #{member.memberId}
                      </Badge>
                      <Badge
                        className={`font-bold px-4 py-1.5 rounded-full border-none ${
                          isExpired ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {isExpired ? checkIn("expired") : checkIn("active")}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger
                    render={
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-bold shadow-lg shadow-indigo-500/20 transition-all">
                        <CreditCard className="mr-2 w-5 h-5" />
                        {p("record")}
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 p-8">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">{p("record")}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRecordPayment} className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <Label className="font-bold ml-1">{p("plan")}</Label>
                        <Select name="planId" required>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Select Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} ({plan.price} ETB)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold ml-1">{p("method")}</Label>
                        <Select name="paymentMethod" defaultValue="Cash">
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">{p("cash")}</SelectItem>
                            <SelectItem value="Bank Transfer">{p("transfer")}</SelectItem>
                            <SelectItem value="Other">{p("other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold ml-1">{p("notes")}</Label>
                        <Input name="notes" className="h-12 rounded-xl" />
                      </div>
                      <Button type="submit" disabled={submittingPayment} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg">
                        {submittingPayment ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
                        {p("record")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subscription Ends</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {member.expiryDate ? format(new Date(member.expiryDate), "MMM dd, yyyy") : "N/A"}
            </p>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Days Remaining</p>
            <p className={`text-xl font-black ${daysLeft < 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {daysLeft < 0 ? 0 : daysLeft} Days
            </p>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Visits</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{member.attendances.length}</p>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalPaid.toLocaleString()} ETB</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 dark:border-zinc-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="text-indigo-600" />
                <CardTitle className="text-xl font-black">Attendance History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                  <TableRow className="border-none">
                    <TableHead className="px-8 font-bold text-xs uppercase">Date</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-right px-8">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.attendances.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="p-10 text-center text-slate-400">No visits recorded.</TableCell></TableRow>
                  ) : (
                    member.attendances.map((attendance) => (
                      <TableRow key={attendance.id} className="border-slate-50 dark:border-zinc-800/50">
                        <TableCell className="px-8 py-4 font-bold text-slate-700 dark:text-zinc-300">
                          {format(new Date(attendance.checkIn), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right px-8 font-medium text-slate-400">
                          {format(new Date(attendance.checkIn), "HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 dark:border-zinc-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="text-emerald-600" />
                <CardTitle className="text-xl font-black">Payment History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                  <TableRow className="border-none">
                    <TableHead className="px-8 font-bold text-xs uppercase">Date</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Plan</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-right px-8">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.payments.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="p-10 text-center text-slate-400">No payments recorded.</TableCell></TableRow>
                  ) : (
                    member.payments.map((payment) => (
                      <TableRow key={payment.id} className="border-slate-50 dark:border-zinc-800/50">
                        <TableCell className="px-8 py-4 font-bold text-slate-700 dark:text-zinc-300">
                          {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium text-slate-400">{payment.plan?.name}</TableCell>
                        <TableCell className="text-right px-8 font-black text-emerald-600">
                          {payment.amount.toLocaleString()} ETB
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
