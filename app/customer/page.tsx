'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xojpmzxnvjojenicmvib.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvanBtenhudmpvamVuaWNtdmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODg2NTAsImV4cCI6MjEwMzU2NDY1MH0.CzckS-2IoSVSburZLfhbBOJEOz4LiXIgqbdwyCm_R-0';
// SINGLETON SUPABASE - avoids "GoTrueClient multiple instances" warnings
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const getSupabase = () => supabase;

type Customer = {
  customer_name?: string;
  name?: string;
  phone?: string;
  id?: string | number;
};

type VehicleRecord = {
  id: string;
  vehicle_type?: string;
  model_name?: string;
  chassis_no?: string;
  engine_no?: string;
  color?: string;
  price?: number;
  stock?: number;
  status?: string;
  created_at?: string;
};

type ServiceRecord = {
  id: string;
  customer_name?: string;
  phone?: string;
  model_name?: string;
  chassis_no?: string;
  service_type?: string;
  service_date?: string;
  amount?: number;
  status?: string;
  qr_code?: string;
  created_at?: string;
};

type InsuranceRecord = {
  id: string;
  customer_name?: string;
  phone?: string;
  model_name?: string;
  policy_no?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  amount?: number;
  status?: string;
  created_at?: string;
};

type CustomerProfile = {
  id: string;
  customer_name?: string;
  name?: string;
  phone?: string;
  address?: string;
  vehicle_type?: string;
  model_name?: string;
  chassis_no?: string;
  engine_no?: string;
  color?: string;
  total_amount?: number;
  advance_amount?: number;
  due_amount?: number;
  payment_mode?: string;
  created_at?: string;
};

export default function CustomerPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [insurances, setInsurances] = useState<InsuranceRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Service booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState('General Service');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState(''); // currently not saved; add column if needed
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingQrCode, setBookingQrCode] = useState('');
  const [bookingQrImage, setBookingQrImage] = useState('');

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const raw = localStorage.getItem('hravo_customer');
        if (!raw) {
          router.replace('/');
          return;
        }

        const parsed = JSON.parse(raw) as Customer;
        setCustomer(parsed);

        const sup = getSupabase();
        const phone = parsed.phone;

        if (phone) {
          const { data: profileData } = await sup
            .from('customer_profiles')
            .select('*')
            .eq('phone', phone)
            .maybeSingle();
          
          if (profileData) {
            setCustomerProfile(profileData);
            const chassisNo = profileData.chassis_no;

            if (chassisNo) {
              const { data: vehicleData } = await sup
                .from('vehicle_inventory')
                .select('*')
                .eq('chassis_no', chassisNo)
                .maybeSingle();
              
              if (vehicleData) setVehicle(vehicleData);
            }

            const { data: serviceData } = await sup
              .from('service_bookings')
              .select('*')
              .eq('phone', phone)
              .order('created_at', { ascending: false });
            
            if (serviceData) setServices(serviceData);

            const { data: insuranceData } = await sup
              .from('insurance')
              .select('*')
              .eq('phone', phone)
              .order('created_at', { ascending: false });
            
            if (insuranceData) setInsurances(insuranceData);
          }
        }
      } catch (err) {
        console.error('Customer data load error:', err);
      } finally {
        setReady(true);
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [router]);

  const submitBooking = async () => {
    if (!bookingDate) {
      alert('Please select a preferred date');
      return;
    }

    const sup = getSupabase();
    const phone = customer?.phone;
    if (!phone) return;

    // QR code generation happens inside the submit handler (not during render).
    // Date.now is flagged by react-hooks/purity but is safe here.
    // eslint-disable-next-line react-hooks/purity
    const qrCode = 'HRAVO-SVC-' + Date.now().toString().slice(-6) + '-' + phone.slice(-4);

    try {
      // notes field is not inserted because 'notes' column does not exist in service_bookings table
      const { data, error } = await sup.from('service_bookings').insert([
        {
          customer_name: customerName || 'Customer',
          phone: phone,
          model_name: customerProfile?.model_name || vehicle?.model_name || '',
          chassis_no: customerProfile?.chassis_no || vehicle?.chassis_no || '',
          service_type: bookingServiceType,
          service_date: bookingDate,
          status: 'pending',
          qr_code: qrCode,
          amount: 0,
        },
      ]).select();

      if (error) {
        alert('Booking failed: ' + error.message);
        return;
      }

      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
      setBookingQrCode(qrCode);
      setBookingQrImage(qrImage);
      setBookingSubmitted(true);

      const { data: updatedServices } = await sup
        .from('service_bookings')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false });
      if (updatedServices) setServices(updatedServices);

    } catch (err: any) {
      alert('Unexpected error: ' + (err?.message || 'Unknown'));
    }
  };

  if (!ready) {
    return <div className="min-h-screen bg-[#05070b]" />;
  }

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070b] px-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-black tracking-[0.2em]">ACCESS DENIED</h1>
          <p className="mt-3 text-sm text-slate-300">Please login from the main page.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const customerName = customer.customer_name || customer.name || customerProfile?.customer_name || 'Customer';
  const customerPhone = customer.phone || customerProfile?.phone || 'Not available';
  const dueAmount = customerProfile?.due_amount || 0;
  const totalAmount = customerProfile?.total_amount || 0;
  const advanceAmount = customerProfile?.advance_amount || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '◉' },
    { id: 'vehicle', label: 'My Vehicle', icon: '▲' },
    { id: 'service', label: 'Service', icon: '✦' },
    { id: 'insurance', label: 'Insurance', icon: '▣' },
  ];

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_24%)]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/80 p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-lg font-black">H</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-red-400">HRAVO</p>
              <h1 className="mt-1 text-lg font-black tracking-[0.2em]">CUSTOMER</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                  activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Due Amount</p>
              <p className={`mt-3 text-2xl font-black ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-300'}`}>
                ₹{dueAmount.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('hravo_customer');
                router.push('/');
              }}
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-red-400">Profile</p>
                <h2 className="mt-1 text-xl font-black tracking-[0.12em]">{customerName}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:block rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold">{customerPhone}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('hravo_customer');
                    router.push('/');
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 lg:hidden"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6">
            {/* Mobile tabs */}
            <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                    activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-4 text-sm text-slate-400">Loading your data...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <section className="rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-950 p-8 shadow-2xl">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-red-300">Welcome</p>
                      <h2 className="mt-4 text-4xl font-black tracking-tight">{customerName}</h2>
                      <p className="mt-4 text-slate-300">Your personal mobility dashboard is ready.</p>
                      <div className="mt-8 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Phone</p>
                          <p className="mt-2 text-xl font-bold text-white">{customerPhone}</p>
                        </div>
                        {customerProfile?.address && (
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Address</p>
                            <p className="mt-2 text-sm font-bold text-white">{customerProfile.address}</p>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Purchase Summary</p>
                      <div className="mt-6 space-y-4">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Total Amount</p>
                          <p className="mt-2 text-2xl font-black text-white">₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Advance Paid</p>
                          <p className="mt-2 text-xl font-bold text-white">₹{advanceAmount.toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Due Amount</p>
                          <p className={`mt-2 text-xl font-bold ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-300'}`}>
                            ₹{dueAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'vehicle' && (
                  <div className="grid gap-5 md:grid-cols-2">
                    {vehicle ? (
                      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">My Vehicle</p>
                        <div className="mt-6 space-y-4">
                          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Model</p>
                            <p className="mt-2 text-2xl font-black text-white">{vehicle.model_name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Chassis No</p>
                              <p className="mt-2 text-sm font-bold text-white font-mono">{vehicle.chassis_no}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Engine No</p>
                              <p className="mt-2 text-sm font-bold text-white font-mono">{vehicle.engine_no || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Color</p>
                              <p className="mt-2 text-sm font-bold text-white">{vehicle.color || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Price</p>
                              <p className="mt-2 text-sm font-bold text-white">₹{vehicle.price?.toLocaleString() || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </section>
                    ) : (
                      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">My Vehicle</p>
                        <p className="mt-6 text-slate-300">No vehicle information found.</p>
                      </section>
                    )}

                    {customerProfile && (
                      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Purchase Details</p>
                        <div className="mt-6 space-y-4">
                          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Vehicle Type</p>
                            <p className="mt-2 text-2xl font-black text-white">{customerProfile.vehicle_type || 'N/A'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Payment Mode</p>
                              <p className="mt-2 text-sm font-bold text-white">{customerProfile.payment_mode || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Purchase Date</p>
                              <p className="mt-2 text-sm font-bold text-white">
                                {customerProfile.created_at ? new Date(customerProfile.created_at).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {activeTab === 'service' && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowBookingForm(!showBookingForm)}
                        className="rounded-full bg-emerald-500 text-black px-5 py-2 text-xs font-black uppercase tracking-wider"
                      >
                        {showBookingForm ? 'Cancel' : '+ Book Service'}
                      </button>
                    </div>

                    {showBookingForm && (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                        <p className="font-black text-xs mb-3">New Service Booking</p>
                        <div className="space-y-3">
                          <select
                            value={bookingServiceType}
                            onChange={(e) => setBookingServiceType(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs"
                          >
                            <option>General Service</option>
                            <option>Free Service</option>
                            <option>Repair</option>
                            <option>Oil Change</option>
                            <option>Brake Check</option>
                          </select>
                          <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs"
                          />
                          <textarea
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            placeholder="Notes (optional)"
                            className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs"
                            rows={2}
                          />
                          <button
                            onClick={submitBooking}
                            className="w-full bg-emerald-500 text-black py-3 rounded-xl font-black text-xs"
                          >
                            Submit Booking
                          </button>
                        </div>
                      </div>
                    )}

                    {bookingSubmitted && bookingQrCode && (
                      <div className="rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                        <p className="font-black text-xs text-emerald-300 mb-2">Booking Created! Show this QR to service staff</p>
                        <Image
                          src={bookingQrImage}
                          alt="Service QR"
                          width={160}
                          height={160}
                          className="mx-auto w-40 h-40 bg-white p-2 rounded-xl"
                        />
                        <p className="mt-2 font-mono text-[10px] opacity-50">{bookingQrCode}</p>
                        <button
                          onClick={() => {
                            setBookingSubmitted(false);
                            setBookingQrCode('');
                            setBookingQrImage('');
                          }}
                          className="mt-3 bg-white/10 px-4 py-2 rounded-full text-xs font-black"
                        >
                          Close
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="font-black text-xs opacity-50">Your Service Records</p>
                      {services.length > 0 ? (
                        services.map((service) => (
                          <div key={service.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-black text-xs">{service.service_type}</p>
                                <p className="text-xs opacity-40 mt-1">
                                  {service.model_name} | {service.service_date}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-xs">₹{service.amount?.toLocaleString() || 'Pending'}</p>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-black ${
                                  service.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                  {service.status?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            {service.status !== 'completed' && service.qr_code && (
                              <div className="mt-2 flex items-center gap-2">
                                <Image
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(service.qr_code)}`}
                                  alt="QR"
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 bg-white p-1 rounded"
                                />
                                <span className="text-[10px] font-mono opacity-40">{service.qr_code}</span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
                          <p className="text-slate-300">No service records found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'insurance' && (
                  <div className="space-y-4">
                    {insurances.length > 0 ? (
                      insurances.map((insurance) => (
                        <div key={insurance.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-black text-xs">{insurance.company}</p>
                              <p className="text-xs opacity-40 mt-1">
                                Policy: {insurance.policy_no || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-xs">₹{insurance.amount?.toLocaleString() || 'N/A'}</p>
                              <p className="text-[10px] opacity-40">
                                {insurance.start_date} to {insurance.end_date}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-slate-300">No insurance records found.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}