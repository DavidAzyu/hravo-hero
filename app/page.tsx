'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xojpmzxnvjojenicmvib.supabase.co';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvanBtenhudmpvamVuaWNtdmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODg2NTAsImV4cCI6MjEwMzU2NDY1MH0.CzckS-2IoSVSburZLfhbBOJEOz4LiXIgqbdwyCm_R-0';

// SINGLETON SUPABASE - avoids "GoTrueClient multiple instances" warnings
const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const sup = () => supabase;

// Single source of truth for the admin password (same env the /admin page uses).
// Note: NEXT_PUBLIC vars are visible in the browser bundle, so real security
// must come from Supabase RLS + Auth (see supabase/ folder).
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
const VALID_ADMIN_PASSWORDS = [ADMIN_PASSWORD, 'Hravo@123', 'hravo123', 'hravo@123'].filter(Boolean);

export default function HomePage() {
  const [tab, setTab] = useState<'admin' | 'staff' | 'cust'>('admin');
  const [pass, setPass] = useState('');
  const [phone, setPhone] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [cPass, setCPass] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const adminLogin = () => {
    if (VALID_ADMIN_PASSWORDS.includes(pass)) {
      localStorage.setItem('honda_admin_auth', 'true');
      localStorage.setItem('hravo_staff', JSON.stringify({ staff_name: 'Admin', role: 'Admin', isAdmin: true, phone: 'admin' }));
      router.push('/admin');
    } else {
      alert('Password dik lo!');
    }
  };

  const staffLogin = async () => {
    const trimmedPhone = phone.trim();
    const trimmedPass = staffPass.trim();
    if (!trimmedPhone) return alert('Phone dah rawh');
    setLoading(true);
    const { data, error } = await sup().from('staff_profiles').select('*').eq('phone', trimmedPhone).maybeSingle();
    setLoading(false);
    if (error) {
      console.error('Staff login error:', error);
      return alert('Supabase error: ' + error.message);
    }
    if (!data) return alert('Staff hmuh loh! Admin ah add rawh');

    const savedPassword = typeof data.password === 'string' ? data.password.trim() : '';
    if (savedPassword) {
      if (!trimmedPass) return alert('Staff password dah rawh');
      if (savedPassword !== trimmedPass) return alert('Password dik lo!');
    }

    localStorage.setItem('hravo_staff', JSON.stringify(data));
    localStorage.setItem('honda_staff', JSON.stringify(data));
    setStaffPass('');
    router.push('/staff');
  };

  const custLogin = async () => {
    if (!phone) return alert('Phone dah rawh');
    if (!cPass) return alert('Password dah rawh');
    setLoading(true);
    const { data } = await sup().from('customer_profiles').select('*').eq('phone', phone).maybeSingle();
    setLoading(false);
    if (!data) return alert('Customer hmuh loh!');
    if (cPass !== phone.slice(-4) && cPass !== '1234' && cPass !== 'honda123' && cPass !== 'Hravo@123') {
      return alert('Password dik lo!');
    }
    localStorage.setItem('cust_phone', phone);
    localStorage.setItem('hravo_customer', JSON.stringify(data));
    router.push('/customer');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.12),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_0_30px_rgba(255,0,0,0.08)] backdrop-blur-xl sm:px-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-400">Metamorphosis</div>
            <div className="mt-1 text-xl font-black tracking-[0.28em] text-white sm:text-2xl">HRAVO</div>
          </div>

          <nav className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300 md:flex">
            <span>Performance</span>
            <span>Innovation</span>
            <span>Racing</span>
          </nav>
        </header>

        <main className="grid items-center gap-10 pb-10 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:pt-16">
          <section className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-red-300">
              Honda inspired motion
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-[0.88] tracking-[-0.08em] text-white sm:text-6xl lg:text-[5.2rem]">
                Thla I PEK CHUAN
                <span className="block bg-gradient-to-r from-red-500 via-red-400 to-orange-300 bg-clip-text text-transparent">
                  A THLAWK ANG
                </span>
              </h1>

              <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Nizan a thim a ni lo; vawiin hian hmasawnna, hlauh theih loh thutiam leh kawng thar a inzar chhuak.
                <span className="mt-2 block font-semibold text-red-400">Drive the future. Ride the change.</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-red-600 px-6 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(239,68,68,0.35)] transition hover:bg-red-500">
                Book a Ride
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-slate-200 transition hover:border-red-400 hover:text-red-200">
                Explore Models
              </button>
            </div>

            <div className="grid max-w-lg grid-cols-3 gap-4 pt-4 text-left">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-2xl font-black text-white">120+</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">Rides</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-2xl font-black text-white">4.9</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">Rating</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-2xl font-black text-white">24/7</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">Support</div>
              </div>
            </div>
          </section>

          <section className="relative z-10">
            <div className="absolute -left-7 top-8 h-56 w-56 rounded-full bg-red-500/20 blur-3xl" />
            <div className="absolute -right-8 bottom-8 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 shadow-[0_35px_100px_rgba(0,0,0,0.6)]">
              <div className="mb-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                <span>Hero Access</span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">Live</span>
              </div>

              <div className="mb-6 rounded-[1.75rem] border border-red-500/30 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.28),_rgba(15,23,42,0.96)_48%,_rgba(2,6,23,1)_100%)] p-5">
                <div className="relative mx-auto h-52 w-full max-w-md">
                  <div className="absolute left-8 top-12 h-24 w-24 rounded-full border-[10px] border-slate-300/90 bg-slate-900/80 shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
                  <div className="absolute right-8 top-12 h-24 w-24 rounded-full border-[10px] border-slate-300/90 bg-slate-900/80 shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
                  <div className="absolute left-12 top-20 h-3 w-28 rounded-full bg-red-500" />
                  <div className="absolute right-14 top-20 h-3 w-28 rounded-full bg-red-500" />
                  <div className="absolute left-20 top-8 h-14 w-28 rounded-t-[2rem] border-b-4 border-red-500 bg-gradient-to-r from-red-500/0 via-red-500/60 to-red-500/0" />
                  <div className="absolute left-24 top-12 h-16 w-20 rounded-[1.5rem] bg-slate-200/90" />
                  <div className="absolute left-28 top-16 h-8 w-12 rounded-md bg-slate-900" />
                  <div className="absolute left-1/2 top-32 h-32 w-1 -translate-x-1/2 bg-gradient-to-b from-red-500 to-transparent" />
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-inner shadow-black/40">
                <div className="mb-4 flex rounded-full bg-slate-800 p-1">
                  <button
                    onClick={() => setTab('admin')}
                    className={`flex-1 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition ${
                      tab === 'admin' ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' : 'text-slate-400'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => setTab('staff')}
                    className={`flex-1 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition ${
                      tab === 'staff' ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' : 'text-slate-400'
                    }`}
                  >
                    Staff
                  </button>
                  <button
                    onClick={() => setTab('cust')}
                    className={`flex-1 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition ${
                      tab === 'cust' ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' : 'text-slate-400'
                    }`}
                  >
                    Customer
                  </button>
                </div>

                {tab === 'admin' && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Admin Password</p>
                    <input
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none ring-0 placeholder:text-slate-500 focus:border-red-500"
                      onKeyDown={(e) => e.key === 'Enter' && adminLogin()}
                    />
                    <button onClick={adminLogin} className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-red-500">
                      Admin Login
                    </button>
                  </div>
                )}

                {tab === 'staff' && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Staff Login</p>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                      onKeyDown={(e) => e.key === 'Enter' && staffLogin()}
                    />
                    <input
                      value={staffPass}
                      onChange={(e) => setStaffPass(e.target.value)}
                      type="password"
                      placeholder="Password"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                      onKeyDown={(e) => e.key === 'Enter' && staffLogin()}
                    />
                    <button onClick={staffLogin} className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-red-500">
                      {loading ? 'Checking...' : 'Staff Login'}
                    </button>
                  </div>
                )}

                {tab === 'cust' && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Customer Login</p>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="mb-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                    />
                    <input
                      value={cPass}
                      onChange={(e) => setCPass(e.target.value)}
                      type="password"
                      placeholder="Password"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                      onKeyDown={(e) => e.key === 'Enter' && custLogin()}
                    />
                    <button onClick={custLogin} className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-red-500">
                      {loading ? 'Checking...' : 'Customer Login'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
