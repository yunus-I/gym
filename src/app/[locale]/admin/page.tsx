'use client';

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, CreditCard, Plus, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface GymWithCounts {
  id: string;
  name: string;
  location: string | null;
  createdAt: string;
  _count: { members: number; users: number; plans: number };
}

export default function AdminPage() {
  const router = useRouter();
  const [gyms, setGyms] = useState<GymWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", managerEmail: "", managerPassword: "", managerName: "" });
  const [creating, setCreating] = useState(false);

  const fetchGyms = async () => {
    const res = await fetch("/api/admin/gyms");
    if (res.ok) setGyms(await res.json());
    setLoading(false);
  };

  useEffect(() => { void fetchGyms(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/gyms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ name: "", location: "", managerEmail: "", managerPassword: "", managerName: "" });
      void fetchGyms();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its data? This cannot be undone.`)) return;
    await fetch(`/api/admin/gyms/${id}`, { method: "DELETE" });
    void fetchGyms();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded">Administration</span>
          <h1 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">Gym Houses</h1>
          <p className="text-zinc-400 text-xs mt-2 font-medium">Manage all registered gym locations and their staff.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-[#FF6B00] hover:bg-[#FF8C39] text-black font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 border-none cursor-pointer">
          <Plus className="w-4 h-4" />
          New Gym
        </Button>
      </div>

      {showCreate && (
        <Card className="bg-[#151515] border border-white/5 rounded-2xl p-6 max-w-xl">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gym Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Power House Gym" className="h-10 text-sm bg-zinc-800/50 border-white/10 text-white rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bole, Addis" className="h-10 text-sm bg-zinc-800/50 border-white/10 text-white rounded-xl" />
              </div>
            </div>
            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Default Manager Account</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Manager Name</Label>
                  <Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} placeholder="e.g. John" className="h-10 text-sm bg-zinc-800/50 border-white/10 text-white rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email *</Label>
                  <Input value={form.managerEmail} onChange={(e) => setForm({ ...form, managerEmail: e.target.value })} required type="email" placeholder="manager@gym.com" className="h-10 text-sm bg-zinc-800/50 border-white/10 text-white rounded-xl" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Password *</Label>
                  <Input value={form.managerPassword} onChange={(e) => setForm({ ...form, managerPassword: e.target.value })} required type="password" placeholder="Min 6 characters" className="h-10 text-sm bg-zinc-800/50 border-white/10 text-white rounded-xl" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={() => setShowCreate(false)} className="flex-1 h-10 border border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 rounded-xl text-xs font-bold border-solid cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={creating} className="flex-[2] h-10 bg-[#FF6B00] hover:bg-[#FF8C39] text-black font-bold rounded-xl text-xs border-none cursor-pointer disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Gym"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm font-semibold">No gyms registered yet.</p>
          </div>
        ) : gyms.map((gym) => (
          <Card key={gym.id} className="bg-[#151515] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => router.push(`/admin/gyms/${gym.id}`)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-none cursor-pointer" title="Manage">
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(gym.id, gym.name)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-none cursor-pointer" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C39] flex items-center justify-center font-black text-black mb-4 shadow-lg shadow-[#FF6B00]/25">
              {gym.name.charAt(0)}
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{gym.name}</h3>
            <p className="text-[10px] text-zinc-500 font-mono mb-1">{gym.location || "No location set"}</p>
            <p className="text-[10px] text-zinc-600">Created {format(new Date(gym.createdAt), "MMM dd, yyyy")}</p>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-bold text-white">{gym._count.members}</span>
                <span className="text-[9px] text-zinc-500">members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-bold text-white">{gym._count.plans}</span>
                <span className="text-[9px] text-zinc-500">plans</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-bold text-white">{gym._count.users}</span>
                <span className="text-[9px] text-zinc-500">staff</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
