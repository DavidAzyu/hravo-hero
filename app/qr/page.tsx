'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// SINGLETON SUPABASE - avoids "GoTrueClient multiple instances" warnings
const supabase = createClient(
  // SECURITY: env-only, no hardcoded fallbacks (set in .env.local / Vercel)
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// output: 'export' (static export) a ni vang, dynamic route /qr/[code] chu
// build-time ah export theilo (generateStaticParams neilo vang).
// Chuvangin he page hi static /qr/ route a ni a, booking code hi ?code=
// query param atanga client-side ah kan read ang.
//   URL format: /qr/?code=HRAVO-XXXX
export default function QRView() {
  const [code, setCode] = useState<string | null>(null);
  const [noCode, setNoCode] = useState(false);
  const [d, setD] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  // Read ?code= from the URL once, on the client
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code');
    if (c) {
      setCode(c);
    } else {
      setNoCode(true);
    }
  }, []);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase
          .from('service_bookings')
          .select('*')
          .eq('qr_code', code)
          .maybeSingle();
        if (cancelled) return;
        setD(data ?? null);
        setNotFound(!data);
      } catch {
        if (cancelled) return;
        setD(null);
        setNotFound(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (noCode || notFound) {
    return (
      <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm border-2 border-black rounded-xl p-5 text-center">
          <div className="bg-black text-white inline-block px-3 py-1 rounded-lg font-black text-xs">HRAVO</div>
          <h1 className="font-black mt-4 text-2xl">NOT FOUND</h1>
          <p className="mt-2 text-xs">
            {code ? (
              <>
                Booking QR <b>{code}</b> hi hmuh loh. Code dik lo emaw, booking delete/in update a nih thei.
              </>
            ) : (
              <>Booking QR code a paih lo. URL hi /qr/?code=BOOKING-CODE a nih ang.</>
            )}
          </p>
          <Link href="/" className="mt-5 inline-block bg-black text-white px-5 py-3 rounded-xl font-black text-xs">
            BACK HOME
          </Link>
        </div>
      </div>
    );
  }

  if (!code || !d) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading {code ?? ''}
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
