'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// SECURITY: env-only config - no secrets hardcoded in source.
// Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (and Vercel).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const sup = () => supabase;

// SECURITY: admin password is verified server-side via the verify_admin_password()
// RPC (created by supabase/security-hardening.sql) so it never ships in the client
// bundle. LEGACY_ADMIN_PASSWORD below is only a fallback used until that SQL file
// is applied - once it is, remove NEXT_PUBLIC_ADMIN_PASSWORD from your env vars.
const LEGACY_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

const verifyAdminPassword = async (pw: string): Promise<boolean> => {
  try {
    const { data, error } = await sup().rpc('verify_admin_password', { p_password: pw });
    if (!error) return data === true;
  } catch {}
  return LEGACY_ADMIN_PASSWORD !== '' && pw === LEGACY_ADMIN_PASSWORD;
};

export default function HomePage() {
  const [tab, setTab] = useState<'admin' | 'staff' | 'cust'>('admin');
  const [pass, setPass] = useState('');
  const [phone, setPhone] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [cPass, setCPass] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const adminLogin = async () => {
    setLoading(true);
    const ok = await verifyAdminPassword(pass);
    setLoading(false);
    if (ok) {
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

    // Preferred: server-side verification via RPC - the staff password column is
    // blocked from public reads by supabase/security-hardening.sql.
    try {
      const { data, error } = await sup().rpc('verify_staff_login', { p_phone: trimmedPhone, p_password: trimmedPass });
      if (!error) {
        setLoading(false);
        const res: any = typeof data === 'string' ? JSON.parse(data) : data;
        if (res?.ok && res.profile) {
          localStorage.setItem('hravo_staff', JSON.stringify(res.profile));
          localStorage.setItem('honda_staff', JSON.stringify(res.profile));
          setStaffPass('');
          router.push('/staff');
        } else if (res?.reason === 'bad_pass') {
          alert('Password dik lo!');
        } else {
          alert('Staff hmuh loh! Admin ah add rawh');
        }
        return;
      }
    } catch {}

    // Legacy fallback (only until supabase/security-hardening.sql is applied)
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

    // Preferred: server-side verification via RPC
    try {
      const { data, error } = await sup().rpc('verify_customer_login', { p_phone: phone, p_password: cPass });
      if (!error) {
        setLoading(false);
        const res: any = typeof data === 'string' ? JSON.parse(data) : data;
        if (res?.ok && res.profile) {
          localStorage.setItem('cust_phone', phone);
          localStorage.setItem('hravo_customer', JSON.stringify(res.profile));
          router.push('/customer');
        } else if (res?.reason === 'bad_pass') {
          alert('Password dik lo!');
        } else {
          alert('Customer hmuh loh!');
        }
        return;
      }
    } catch {}

    // Legacy fallback (password = last 4 digits of the phone number)
    const { data } = await sup().from('customer_profiles').select('*').eq('phone', phone).maybeSingle();
    setLoading(false);
    if (!data) return alert('Customer hmuh loh!');
    if (cPass !== phone.slice(-4)) {
      return alert('Password dik lo!');
    }
    localStorage.setItem('cust_phone', phone);
    localStorage.setItem('hravo_customer', JSON.stringify(data));
    router.push('/customer');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#05070b] text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.12),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        {/* Header */}
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

        {/* Main content */}
        <main className="grid items-center gap-10 pb-10 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:pt-16">
          {/* Left side — Hero text with wings */}
          <section className="relative z-10 space-y-6">
            {/* PNG Logo (thla.png) hi dahna */}
            <div className="space-y-4">
              
              {/* THLA Wings PNG - `/thla.png` hmang a ni */}
              <div className="mb-4">
                <img 
                  src="/thla.png" 
                  alt="THLA Wings Logo" 
                  className="h-28 w-auto sm:h-36 lg:h-44 drop-shadow-[0_0_30px_rgba(255,0,0,0.3)]" 
                />
              </div>

              {/* 🔽 UPDATED HEADING – OPTION 2 🔽 */}
              <h1 className="text-3xl font-black leading-[0.88] tracking-[-0.08em] text-white sm:text-4xl lg:text-[3.75rem]">
                <span className="block mt-1">
                  <span className="inline-block">PELA</span>
                  <span className="inline-block mx-2 text-white">·</span>
                  <span className="inline-block text-red-500">A</span>
                  <span className="inline-block mx-2 text-white">·</span>
                  <span className="inline-block bg-gradient-to-r from-red-500 via-red-400 to-orange-300 bg-clip-text text-transparent">THLAWK</span>
                  <span className="inline-block mx-2 text-white">·</span>
                  <span className="inline-block bg-gradient-to-r from-red-500 via-red-400 to-orange-300 bg-clip-text text-transparent">ANG</span>
                </span>
              </h1>
              {/* 🔼 END UPDATED HEADING 🔼 */}

              {/* Subtitle - HRAVO HERO mawi deuh (Option 1) */}
              <p className="relative max-w-xl text-base leading-7 sm:text-lg">
                <span className="inline-block bg-gradient-to-r from-red-400 via-orange-300 to-yellow-200 bg-clip-text text-2xl font-black uppercase tracking-[0.35em] text-transparent sm:text-3xl">
                  HRAVO HERO
                </span>
                <span className="absolute -bottom-1 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-red-500 to-orange-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                <span className="mt-3 block text-sm font-medium text-red-400/80">
                  DRIVE THE FUTURE · RIDE THE CHANGE.
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/book')}
                className="rounded-full bg-red-600 px-6 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(239,68,68,0.35)] transition hover:bg-red-500"
              >
                Book a Ride
              </button>
              <button
                onClick={() => router.push('/models')}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-slate-200 transition hover:border-red-400 hover:text-red-200"
              >
                Explore Models
              </button>
            </div>

            {/* Stats */}
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

          {/* Right side — Login card */}
          <section className="relative z-10">
            <div className="absolute -left-7 top-8 h-56 w-56 rounded-full bg-red-500/20 blur-3xl" />
            <div className="absolute -right-8 bottom-8 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 shadow-[0_35px_100px_rgba(0,0,0,0.6)]">
              {/* Hero Access header */}
              <div className="mb-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                <span>Hero Access</span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">Live</span>
              </div>

              {/* Bike icon / visual */}
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

              {/* Tabs: Admin | Staff | Customer */}
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

                {/* Admin login form */}
                {tab === 'admin' && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Admin Password</p>
                    <input
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      type="password"
                      placeholder="••••••••••"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none ring-0 placeholder:text-slate-500 focus:border-red-500"
                      onKeyDown={(e) => e.key === 'Enter' && adminLogin()}
                    />
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-white/20 bg-slate-800" />
                        Remember me
                      </label>
                      <button className="text-red-400 hover:underline">Forgot password?</button>
                    </div>
                    <button onClick={adminLogin} className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-red-500">
                      Admin Login
                    </button>
                    <p className="mt-3 text-center text-[10px] text-slate-500">
                      Need access? Contact administrator
                    </p>
                  </div>
                )}

                {/* Staff login form */}
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

                {/* Customer login form */}
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

                {/* Footer text */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[9px] text-slate-500">
                  <span>Secured with 256-bit encryption</span>
                  <span>v2.4.1</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}