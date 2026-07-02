'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ArrowLeft, Plus, Trash2, Loader2, Users, Building2, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface GymUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface GymDetail {
  id: string;
  name: string;
  location: string | null;
  createdAt: string;
  users: GymUser[];
  _count: { members: number; plans: number };
}

export default function GymDetailPage() {
  const router = useRouter();
  const params = useParams();
  const gymId = params.id as string;

  const [gym, setGym] = useState<GymDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ email: "", password: "", name: "", role: "TICKER" });
  const [adding, setAdding] = useState(false);

  const fetchGym = async () => {
    const res = await fetch(`/api/admin/gyms/${gymId}`);
    if (res.ok) setGym(await res.json());
    setLoading(false);
  };

  useEffect(() => { void fetchGym(); }, [gymId]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const res = await fetch(`/api/admin/gyms/${gymId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    if (res.ok) {
      setShowAddUser(false);
      setUserForm({ email: "", password: "", name: "", role: "TICKER" });
      void fetchGym();
    }
    setAdding(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Remove this staff member?")) return;
    await fetch(`/api/admin/gyms/${gymId}/users/${userId}`, { method: "DELETE" });
    void fetchGym();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
    </div>
  );

  if (!gym) return (
    <div className="text-center py-16">
      <p className="text-zinc-500">Gym not found.</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <button onClick={() => router.push("/admin")} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors border-none cursor-pointer bg-transparent">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Gyms
      </button>

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded">Gym Details</span>
          <h1 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">{gym.name}</h1>
          <p className="text-zinc-400 text-xs mt-1 font-medium">{gym.location || "No location"} · Created {format(new Date(gym.createdAt), "MMM dd, yyyy")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#151515] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{gym._count.members}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Members</p>
          </div>
        </Card>
        <Card className="bg-[#151515] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{gym._count.plans}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Plans</p>
          </div>
        </Card>
        <Card className="bg-[#151515] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{gym.users.length}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Staff</p>
          </div>
        </Card>
      </div>

      <Card className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Staff Accounts</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Manage users who can access this gym&apos;s system.</p>
          </div>
          <Button onClick={() => setShowAddUser(!showAddUser)} className="bg-[#FF6B00] hover:bg-[#FF8C39] text-black font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add User
          </Button>
        </div>

        {showAddUser && (
          <div className="p-5 border-b border-white/5 bg-white/[0.01]">
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Name</Label>
                <Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Staff name" className="h-9 text-xs bg-zinc-800/50 border-white/10 text-white rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email *</Label>
                <Input value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required type="email" placeholder="email@example.com" className="h-9 text-xs bg-zinc-800/50 border-white/10 text-white rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Password *</Label>
                <Input value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required type="password" placeholder="Min 6 chars" className="h-9 text-xs bg-zinc-800/50 border-white/10 text-white rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Role</Label>
                <div className="flex gap-2">
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="flex-1 h-9 text-xs bg-zinc-800/50 border border-white/10 text-white rounded-lg px-2 outline-none cursor-pointer">
                    <option value="TICKER">TICKER</option>
                    <option value="MANAGER">MANAGER</option>
                  </select>
                  <Button type="submit" disabled={adding} className="h-9 px-3 bg-[#FF6B00] hover:bg-[#FF8C39] text-black font-bold text-xs rounded-lg border-none cursor-pointer disabled:opacity-50 shrink-0">
                    {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-white/5">
          {gym.users.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">No staff accounts yet.</div>
          ) : gym.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C39]/20 flex items-center justify-center text-xs font-black text-[#FF6B00]">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.name || "Unnamed"}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.role === "MANAGER" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : user.role === "ADMIN" ? "bg-purple-500/10 text-purple-400" : "bg-zinc-500/10 text-zinc-400"}`}>
                  {user.role}
                </span>
                <span className="text-[9px] text-zinc-600 hidden md:block">Joined {format(new Date(user.createdAt), "MMM dd")}</span>
                <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors border-none cursor-pointer" title="Remove user">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
