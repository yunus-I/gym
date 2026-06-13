'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";

interface PlanOption {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export default function RegisterMemberPage() {
  const t = useTranslations("Members");
  const common = useTranslations("Common");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    age: "",
    gender: "male",
    planId: "",
    photoUrl: "",
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/plans")
      .then((res) => res.json())
      .then((data: PlanOption[]) => {
        if (cancelled) return;

        setPlans(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, planId: data[0].id }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Max 2MB allowed.");
      return;
    }
 
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
 
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        const result = (await res.json()) as { url: string };
        setFormData((prev) => ({ ...prev, photoUrl: result.url }));
      } else {
        console.error("Upload failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/members"), 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-center space-y-4 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("success")}</h1>
          <p className="text-slate-500 dark:text-zinc-400">Redirecting to members list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("register")}
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">
              Add a new member to the system and assign a subscription.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
            {common("cancel")}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Photo Section */}
          <Card className="md:col-span-1 rounded-[2rem] border-none shadow-xl shadow-indigo-500/5 bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {t("photo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-10">
              <div 
                className="relative group cursor-pointer"
                onClick={() => document.getElementById("photo-input")?.click()}
              >
                <Avatar className="w-40 h-40 border-4 border-slate-50 dark:border-zinc-800 shadow-2xl">
                  <AvatarImage src={formData.photoUrl} />
                  <AvatarFallback className="bg-slate-100 dark:bg-zinc-800 text-slate-400">
                    {uploading ? (
                      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    ) : (
                      <Camera className="w-12 h-12" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase">
                    {uploading ? "Uploading..." : "Upload"}
                  </span>
                </div>
              </div>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <p className="mt-4 text-xs text-center text-slate-400 dark:text-zinc-500 leading-relaxed px-6">
                Recommended: Square image, 500x500px. Maximum 2MB.
              </p>
              {formData.photoUrl && (
                <p className="mt-2 text-xs text-center text-emerald-500 font-semibold">
                  Photo uploaded successfully!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="md:col-span-2 rounded-[2rem] border-none shadow-xl shadow-indigo-500/5 bg-white dark:bg-zinc-900">
            <CardContent className="p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold ml-1">{t("fullName")}</Label>
                  <Input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold ml-1">{t("phoneNumber")}</Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold ml-1">{t("age")}</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold ml-1">{t("gender")}</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => setFormData({ ...formData, gender: val || "male" })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("male")}</SelectItem>
                      <SelectItem value="female">{t("female")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold ml-1">{t("plan")}</Label>
                  <Select
                    value={formData.planId}
                    onValueChange={(val) => setFormData({ ...formData, planId: val || "" })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {plan.price} ETB ({plan.duration} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-10">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {common("loading")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
