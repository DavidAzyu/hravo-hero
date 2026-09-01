'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  // SECURITY: env-only, no hardcoded fallbacks (set in .env.local / Vercel)
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function BookPage() {
  const [models, setModels] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [model, setModel] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    supabase.from('vehicle_inventory').select('*').then(({ data }) => setModels(data || []));
  }, []);

  const handleBook = async () => {
    if (!name || !phone || !model || !date || !time) return alert('Fill all fields');
    await supabase.from('ride_bookings').insert([{ customer_name: name, customer_phone: phone, model_name: model, ride_date: date, ride_time: time, status: 'pending' }]);
    alert('Booked! We will contact you.');
    setName(''); setPhone(''); setModel(''); setDate(''); setTime('');
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-6 rounded-2xl">
        <h1 className="text-3xl font-black mb-6 text-center">Book a Ride</h1>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className="w-full bg-black/50 p-3 rounded-xl mb-3" />
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="w-full bg-black/50 p-3 rounded-xl mb-3" />
        <select value={model} onChange={e=>setModel(e.target.value)} className="w-full bg-black/50 p-3 rounded-xl mb-3">
          <option value="">Select Model</option>
          {models.map((m:any)=><option key={m.id} value={m.model_name}>{m.model_name} - Rs {m.price}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={date} onChange={e=>setDate(e.target.value)} type="date" className="bg-black/50 p-3 rounded-xl" />
          <input value={time} onChange={e=>setTime(e.target.value)} type="time" className="bg-black/50 p-3 rounded-xl" />
        </div>
        <button onClick={handleBook} className="w-full bg-red-600 py-3 rounded-xl font-black">BOOK NOW</button>
      </div>
    </div>
  );
}