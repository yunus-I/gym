'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { formatETB } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Loader2, Save } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export default function PlansPage() {
  const t = useTranslations("Plans");
  const common = useTranslations("Common");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/plans")
      .then((res) => res.json())
      .then((data: Plan[]) => {
        if (!cancelled) setPlans(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      id: currentPlan?.id,
      name: formData.get("name"),
      duration: formData.get("duration"),
      price: formData.get("price"),
      isActive: currentPlan ? currentPlan.isActive : true,
    };

    const method = currentPlan ? "PUT" : "POST";
    await fetch("/api/plans", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setIsDialogOpen(false);
    setCurrentPlan(null);
    const refreshedPlans = (await fetch("/api/plans").then((res) => res.json())) as Plan[];
    setPlans(refreshedPlans);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("title")}
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">
              Define and manage your gym&apos;s membership subscription packages.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger 
              render={
                <Button 
                  onClick={() => setCurrentPlan(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-bold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                >
                  <Plus className="mr-2 w-5 h-5" />
                  {t("addPlan")}
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-zinc-900 p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                  {currentPlan ? t("edit") : t("addPlan")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="font-bold ml-1">{t("name")}</Label>
                  <Input
                    name="name"
                    defaultValue={currentPlan?.name}
                    required
                    className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">{t("duration")}</Label>
                    <Input
                      name="duration"
                      type="number"
                      defaultValue={currentPlan?.duration}
                      required
                      className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">{t("price")}</Label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={currentPlan?.price}
                      required
                      className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50"
                    />
                  </div>
                </div>
                {currentPlan && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                    <Label className="font-bold">{t("status")}</Label>
                    <Switch
                      checked={currentPlan.isActive}
                      onCheckedChange={(val) => setCurrentPlan({ ...currentPlan, isActive: val })}
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30"
                >
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
                  {t("save")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-500/5 bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-medium">Loading your plans...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-zinc-800">
                    <TableHead className="px-8 py-6 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {t("name")}
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {t("duration")}
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {t("price")}
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {t("status")}
                    </TableHead>
                    <TableHead className="px-8 text-right font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {common("actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-20 text-center text-slate-400">
                        {t("noPlans")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors border-slate-50 dark:border-zinc-800/50">
                        <TableCell className="px-8 py-6 font-bold text-slate-900 dark:text-white">
                          {plan.name}
                        </TableCell>
                        <TableCell className="font-medium text-slate-500 dark:text-zinc-400">
                          {plan.duration} days
                        </TableCell>
                        <TableCell className="font-black text-indigo-600 dark:text-indigo-400">
                          {formatETB(plan.price)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            plan.isActive 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                          }`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setCurrentPlan(plan); setIsDialogOpen(true); }}
                            className="rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            {common("edit")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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
