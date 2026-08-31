'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// SINGLETON SUPABASE - avoids "GoTrueClient multiple instances" warnings
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xojpmzxnvjojenicmvib.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvanBtenhudmpvamVuaWNtdmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODg2NTAsImV4cCI6MjEwMzU2NDY1MH0.CzckS-2IoSVSburZLfhbBOJEOz4LiXIgqbdwyCm_R-0',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export default function QRView({ params }: { params: { code: string } }) {
  const [d, setD] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadedCode, setLoadedCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase
          .from('service_bookings')
          .select('*')
          .eq('qr_code', params.code)
          .maybeSingle();
        if (cancelled) return;
        setLoadedCode(params.code);
        setD(data ?? null);
        setNotFound(!data);
      } catch {
        if (cancelled) return;
        setLoadedCode(params.code);
        setD(null);
        setNotFound(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.code]);

  // While the new params.code is being fetched, keep showing a loading screen
  // even if we still have the previous booking's data in state.
  if (loadedCode !== params.code) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading {params.code}
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm border-2 border-black rounded-xl p-5 text-center">
          <div className="bg-black text-white inline-block px-3 py-1 rounded-lg font-black text-xs">HRAVO</div>
          <h1 className="font-black mt-4 text-2xl">NOT FOUND</h1>
          <p className="mt-2 text-xs">
            Booking QR <b>{params.code}</b> hi hmuh loh. Code dik lo emaw, booking delete/in update a nih thei.
          </p>
          <Link href="/" className="mt-5 inline-block bg-black text-white px-5 py-3 rounded-xl font-black text-xs">
            BACK HOME
          </Link>
        </div>
      </div>
    );
  }

  if (!d) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading {params.code}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center">
      <div className="w-full max-w-sm border-2 border-black rounded-xl p-5 text-center">
        <div className="bg-black text-white inline-block px-3 py-1 rounded-lg font-black text-xs">
          HRAVO
        </div>
        <h1 className="font-black mt-2 text-xl tracking-wide">SERVICE BOOKING</h1>
        <p
          className={`mt-2 px-3 py-1 rounded-full text-xs font-black ${
            d.status === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-yellow-400 text-black'
          }`}
        >
          {d.status.toUpperCase()} - {d.qr_code}
        </p>
        <div className="mt-4 text-left space-y-1 text-sm">
          <p>
            <b>{d.customer_name}</b> - {d.phone}
          </p>
          <p>
            {d.model_name} - {d.service_type}
          </p>
          <p>
            Rs {d.amount} - {d.service_date}
          </p>
        </div>
        <Image
          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(d.qr_code)}`}
          width={300}
          height={300}
          className="w-56 h-56 mx-auto mt-4 border-2 border-black rounded-xl"
          alt="QR"
        />
        <p className="text-xs opacity-50 mt-2">Staff/Admin Scan = Completed</p>
        <button
          onClick={() => window.print()}
          className="w-full mt-4 bg-black text-white py-3 rounded-xl font-black text-xs"
        >
          PRINT
        </button>
      </div>
    </div>
  );
}
