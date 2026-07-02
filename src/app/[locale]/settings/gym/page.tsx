'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GymProfile {
  id: string;
  name: string;
  location: string | null;
  logoUrl: string | null;
}

export default function GymProfilePage() {
  const t = useTranslations("Gym");

  const [gym, setGym] = useState<GymProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/gym")
      .then((res) => res.json())
      .then((data: GymProfile | null) => {
        if (!cancelled) setGym(data);
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
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    let logoUrl = gym?.logoUrl ?? null;
    const logoFile = formData.get("logoFile") as File;
    if (logoFile && logoFile.size > 0) {
      const uploadData = new FormData();
      uploadData.append("file", logoFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        logoUrl = uploadResult.url;
      }
    }

    const data = {
      name: formData.get("name"),
      location: formData.get("location"),
      logoUrl: logoUrl,
    };

    const res = await fetch("/api/gym", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSuccess(true);
      // Update local state to reflect new logo
      if (logoUrl) {
        setGym((prev) => prev ? { ...prev, logoUrl } : null);
      }
      setTimeout(() => setSuccess(false), 3000);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
    </div>
  );

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-zinc-400 mt-1">
            Customize your gym&apos;s public identity and location.
          </p>
        </div>

        {success && (
          <div className="bg-emerald-900/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 border border-emerald-500/20">
            <CheckCircle2 />
            <span className="font-bold">{t("success")}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 rounded-2xl border border-white/5 shadow-2xl bg-[#151515] p-8 flex flex-col items-center text-center">
            <Label className="mb-6 font-black uppercase tracking-widest text-xs text-zinc-500">{t("logo")}</Label>
            <Avatar className="w-32 h-32 border-4 border-white/5 shadow-xl mb-6">
              <AvatarImage src={previewUrl || (gym?.logoUrl ?? undefined)} />
              <AvatarFallback className="bg-zinc-800 text-zinc-500">
                <Building2 className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-zinc-500 px-4">This logo will appear on member profiles throughout the app.</p>
            <Input 
              type="file"
              name="logoFile" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreviewUrl(URL.createObjectURL(file));
              }}
              className="mt-6 rounded-xl border-white/10 bg-zinc-800/50 file:bg-[#FF6B00] file:text-black file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 file:font-bold hover:file:bg-[#FF8C39] cursor-pointer"
            />
          </Card>

          <Card className="md:col-span-2 rounded-2xl border border-white/5 shadow-2xl bg-[#151515] p-8 md:p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold ml-1 flex items-center gap-2 text-white">
                  <Building2 className="w-4 h-4 text-[#FF6B00]" />
                  {t("name")}
                </Label>
                <Input
                  name="name"
                  defaultValue={gym?.name ?? ""}
                  required
                  className="h-14 rounded-xl border-white/10 bg-zinc-800/50 text-lg font-bold text-white focus:border-[#FF6B00]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold ml-1 flex items-center gap-2 text-white">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  {t("location")}
                </Label>
                <Input
                  name="location"
                  defaultValue={gym?.location ?? ""}
                  className="h-14 rounded-xl border-white/10 bg-zinc-800/50 text-lg text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-16 bg-[#FF6B00] hover:bg-[#FF8C39] text-black rounded-2xl font-black text-xl shadow-xl shadow-[#FF6B00]/25 transition-all transform active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-6 h-6" />}
              {t("save")}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
