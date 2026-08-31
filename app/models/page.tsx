'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xojpmzxnvjojenicmvib.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvanBtenhudmpvamVuaWNtdmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODg2NTAsImV4cCI6MjEwMzU2NDY1MH0.CzckS-2IoSVSburZLfhbBOJEOz4LiXIgqbdwyCm_R-0'
);

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('vehicle_inventory').select('*').then(({ data }) => setModels(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-[#05070b] text-white p-8">
      <h1 className="text-4xl font-black mb-8">Explore Models</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((m:any) => (
          <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {m.image_url ? <img src={m.image_url} alt={m.model_name} className="h-48 w-full object-cover" /> : <div className="h-48 bg-slate-800 flex items-center justify-center">No Image</div>}
            <div className="p-4">
              <h3 className="text-xl font-bold">{m.model_name}</h3>
              <p className="text-sm text-gray-400">{m.vehicle_type} | {m.color}</p>
              <p className="text-2xl font-black text-red-500 mt-2">Rs {Number(m.price).toLocaleString()}</p>
              <Link href="/book" className="block text-center bg-white text-black py-2 rounded-xl mt-4 font-black">Book Now</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}